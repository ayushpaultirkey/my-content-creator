import "dotenv/config";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import axios from "axios";
import fsp from "fs/promises";
import mime from "mime-types";
import crypto from "crypto";

import directory from "./../library/directory.js";

import Voice from "./asset/voice.js";
import Cache from "./asset/cache.js";
import Uploader from "./asset/uploader.js";

const { __root } = directory();

/**
 * 
 * @param {"IMAGE" | "AUDIO" | "VIDEO"} type 
 * @returns 
*/
function Fallback(type = "") {

    let _path = `/project/.cache/`;
    switch(type) {
        case "IMAGE":
            _path = path.join(__root, _path, "/fallback-i.png");
            break;
        case "VIDEO":
            _path = path.join(__root, _path, "/fallback-v.mp4");
            break;
        case "AUDIO":
            _path = path.join(__root, _path, "/fallback-a.wav");
            break;
    };

    return _path;

};

async function GetAssets(dir = "") {

    try {
        
        // Get files
        const _file = await fsp.readdir(dir);
        const _fileList = [];

        // Iterate for each file
        for(const file of _file) {

            // Get file stat and path
            const _filePath = path.join(dir, file);
            const _fileStat = await fsp.stat(_filePath);
      
            // Check if its file
            if(_fileStat.isFile()) {

                // Check if the file isnt narration file
                if(file.match(/slide[0-9]+\.wav/g)) {
                    continue;
                };

                // Get its mime type
                const _mime = mime.lookup(_filePath);
              
                // Check if the file is an image, video, or audio
                if(_mime && (_mime.startsWith("image/") || _mime.startsWith("video/") || _mime.startsWith("audio/"))) {
                    _fileList.push({
                        name: file,
                        type: _mime,
                        url: `/project//asset/${file}`
                    });
                };

            };
            
        };

        // Return the files list
        return _fileList;

    }
    catch(error) {
        console.error(`Service/Asset.GetLocalAsset(): Error reading directory for project ${projectId}:`, error);
        throw error;
    };

}



async function CropImage({ input = [], output = [], width = 512, height = 512 }) {

    try {

        //
        const _promise = [];

        //
        const _crop = async(source, destination) => {
            return new Promise(async(resolve, reject) => {

                try {

                    if(!source || !destination) {
                        throw new Error("Invalid image asset to crop");
                    };

                    await sharp(source)
                    .resize({
                        width: (width * 1),
                        height: (height * 1),
                        fit: "cover"
                    })
                    .toFile(destination);

                    console.log(`Service/Asset/CropImage(): Image cropped ${destination}`);
                    resolve();

                }
                catch(error) {
                    reject(error);
                };

            });
        };

        // All images and crop it
        for(var i = 0, l = input.length; i < l; i++) {
            if(!input[i] || !output[i]) {
                console.log("Asset/CropImages(): invalid input or output at index", i)
                continue;
            };
            _promise.push(_crop(input[i], output[i]));
        };

        await Promise.all(_promise);

        console.log("Asset/CropImages(): All images cropped");

    }
    catch(error) {
        console.log("Asset/CropImages(): Error cropping images", error);
        throw new Error("Unable to crop images");
    };

};



async function DownloadImage(images = [{ url, name, destination }]) {

    //
    try {
        
        //
        const _validated = [];
        const _promise = [];
        const _download = async(url, filePath) => {

            //
            const _response = await axios({ url: url, responseType: "stream" });
            return new Promise((resolve, reject) => {

                //
                const _writer = fs.createWriteStream(filePath);
                _response.data.pipe(_writer);
            
                //
                _writer.on("finish", () => {

                    _validated.push(filePath);
                    resolve();

                });
                _writer.on("error", reject);

            });
            
        };
    
        //
        for(var i = 0, len = images.length; i < len; i++) {
    
            _promise.push(_download(images[i].url, images[i].destination));
    
        };
    
        // Wait for all images to download
        await Promise.all(_promise);
        console.log("Asset/DownloadImage(): All images downloaded");

        //
        return _validated;

    }
    catch(error) {

        console.log("Asset/DownloadImage(): General error", error);
        throw error;

    };

};


async function FetchExternalImage(keyword, count = 5) {

    //
    const _query = keyword;
    const _cache = Cache.Hit(_query, "image");
    const _cachePath = Cache.Path();
    let _collection = [];


    try {

        //
        if(!count || !keyword) {
            throw new Error("Invalid count or keyword");
        };

        //
        if(!_cache) {

            //
            console.log("S/Asset/FetchExternalImage(): NO CACHE FOUND");

            //
            const { headers, data } = await axios.get("https://pixabay.com/api/", {
                params: {
                    key: process.env.PIXABAY_API,
                    q: _query,
                    per_page: count + 10,
                },
            });

            //
            console.log(`S/Asset/FetchExternalImage(): Rate Limit: ${headers["x-ratelimit-limit"]}`);
            console.log(`S/Asset/FetchExternalImage(): Rate Limit Remaining: ${headers["x-ratelimit-reset"]}`);
            console.log(`S/Asset/FetchExternalImage(): Rate Limit Resets in: ${headers["x-ratelimit-remaining"]} seconds`);

            //
            if(data.hits.length < count) {
                console.log("S/Asset/FetchExternalImage(): Mismatch slides and default images");
            };

            //
            const _image = [];
            for(var i = 0, len = count; i < len; i++) {

                const _name = `/${crypto.randomUUID()}.jpg`;
                const _path = path.join(_cachePath, _name);

                if(!data.hits[i]) {
                    _image.push({
                        name: _name,
                        url: "https://picsum.photos/512",
                        destination: path.join(_cachePath, _name)
                    })
                    console.log("S/Asset/FetchExternalImage(): Invalid response hit at index", i);
                    continue;
                };

                console.log(`S/Asset/FetchExternalImage(): ${_path} qued for download`);

                _image.push({
                    name: _name,
                    url: data.hits[i].largeImageURL,
                    destination: path.join(_cachePath, _name)
                });

            };

            // 
            Cache.Update(_query, "image", _image);
            console.log("S/Asset/FetchExternalImage(): CACHE UPDATED");

            //
            await Cache.Save();
            console.log("S/Asset/FetchExternalImage(): CACHE SAVED");

            //
            _collection = await DownloadImage(_image);

        }
        else {

            //
            console.log("S/Asset/GetLocalAsset(): CACHE FOUND");

            //
            if(_cache.length < count) {
                console.log("S/Asset/GetLocalAsset(): Mismatch slides and default images");
            };

            for(var i = 0, len = count; i < len; i++) {

                //
                if(!_cache[i]) {


                    _collection.push((_cache[0]) ? _cache[0].destination : path.join(Fallback("IMAGE")));

                    console.log("S/Asset/GetLocalAsset(): Invalid cache hit at index", i, " using random index", 0);
                    continue;

                };

                //
                _collection.push(_cache[i].destination);

            };

        };


    }
    catch(error) {
        console.log("S/Asset/FetchExternalImage():", error);
        throw error;
    }
    
    return _collection;

};


async function GetExternalAsset(keyword, count, callback) {

    //
    callback("Asset: Fetching external assets");

    //
    try {

        if(!keyword && !asset) {
            throw new Error("Invalid keyword or asset");
        };
        
        //
        return await FetchExternalImage(keyword, count);

    }
    catch(error) {
        console.log("Asset/GetExternalAsset():", error);
    };

};



async function CreateVoiceAsset({ content, useLocalTTS, callback }) {

    //
    callback("Asset: Creating voice files");

    //
    try {

        //
        if(useLocalTTS) {
            await Voice.ByLocalTTS(content);
        }
        else {
            await Voice.ByExternalTTS(content);
        };

    }
    catch(error) {
        console.log("Service/Asset.CreateVoiceAsset(): General error", error);
        throw error;
    };

};


export default { Uploader, GetAssets, CreateVoiceAsset, GetExternalAsset, Cache, CropImage };