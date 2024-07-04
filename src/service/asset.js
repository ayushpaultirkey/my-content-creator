import "dotenv/config";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import axios from "axios";
import multer from "multer";
import fsp from "fs/promises";
import mime from "mime-types";
import crypto from "crypto";

import directory from "./../library/directory.js";

import Voice from "./asset/voice.js";
import Project from "./project.js";
import Cache from "./asset/cache.js";


/**
    * 
*/
const Uploader = multer({
    storage: multer.diskStorage({
        destination: async(request, file, callback) => {

            try {

                // Get directory
                const { __dirname } = directory();

                // Set upload path
                const _path = path.join(path.join(__dirname, `../../project/.temp/`));
                await fsp.mkdir(_path, { recursive: true });
                
                callback(null, _path);

            }
            catch(error) {
                callback(error);
            };

        },
        filename: (request, file, callback) => {
            
            callback(null, crypto.randomUUID() + path.extname(file.originalname));

        }
    }),
    fileFilter: (request, file, callback) => {

        if(file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/") || file.mimetype.startsWith("audio/")) {
            callback(null, true);
        }
        else {
            callback(new Error("Only images, video, audio are allowed!"), false);
        };

    }
}).array("files", 20);


/**
    * Get the list of assets
    * @param {string} projectId 
    * @returns {Promise<[{file, type, url}] | undefined>}
*/
async function GetLocalAsset(projectId = "") {

    try {
        
        // Get project path and read the project json file
        const _projectPath = path.join(Project.Path(projectId), "/asset/");

        // Get files
        const _file = await fsp.readdir(_projectPath);
        const _fileList = [];

        // Iterate for each file
        for(const file of _file) {

            // Get file stat and path
            const _filePath = path.join(_projectPath, file);
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
                        url: `/project/${projectId}/asset/${file}`
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


/**
    * 
    * @param {*} images 
    * @param {*} projectId 
    * @param {*} project 
*/
async function CropImage(images = [], projectId, project = {}) {

    try {

        let _slide = project.property.slides;
        let _promise = [];

        // Crop image function
        const _crop = async(image, index) => {
            return new Promise(async(resolve, reject) => {

                try {

                    if(!_slide[index] || _slide[index].image.length == 0) {
                        throw new Error("Invalid image asset to crop");
                    };

                    const _inputPath = path.join(Cache.Path(), image.name);
                    const _outputPath = path.join(Project.Path(projectId), `/asset/${_slide[index].image[0].name}`);

                    await sharp(_inputPath)
                    .resize({
                        width: (project.config.width * 1),
                        height: (project.config.height * 1),
                        fit: "cover"
                    })
                    .toFile(_outputPath);

                    console.log(`Service/Asset/CropImage(): Image cropped ${_outputPath}`);
                    resolve();

                }
                catch(error) {
                    reject(error);
                };

            });
        };

        // All images and crop it
        for(var i = 0, l = images.length; i < l; i++) {
            _promise.push(_crop(images[i], i));
        };

        await Promise.all(_promise);

        console.log("Asset/CropImages(): All images cropped");

    }
    catch(error) {
        console.log("Asset/CropImages(): Error cropping images", error);
        throw error;
    };

};


/**
    * 
    * @param {*} image 
*/
async function DownloadImage(image = [{ url, name }]) {

    // Try and download image
    try {

        // Ensure cache directory exists
        const _cachePath = Cache.Path();
        if(!fs.existsSync(_cachePath)) {
            fs.mkdirSync(_cachePath, { recursive: true });
        };

        // Promise array for downloading image
        const _promise = [];
    
        // Download image function
        const _download = async(url, filePath) => {

            const _response = await axios({ url: url, responseType: "stream" });

            return new Promise((resolve, reject) => {

                const _writer = fs.createWriteStream(filePath);
            
                _response.data.pipe(_writer);
            
                _writer.on("finish", resolve);
                _writer.on("error", reject);

            });
            
        };
    
        // Get slides and download image
        for(var i = 0, l = image.length; i < l; i++) {
    
            _promise.push(_download(image[i].url, path.join(_cachePath, `/${image[i].name}`)));
    
        };
    
        // Wait for all images to download
        await Promise.all(_promise);
        console.log("Asset/DownloadImage(): All images downloaded");

    }
    catch(error) {

        console.log("Asset/DownloadImage(): General error", error);
        throw error;

    };

};


/**
    * 
    * @param {*} projectId 
    * @param {*} project 
*/
async function FetchExternalImage(projectId, project = {}) {

    //
    if(typeof(project.property) === "undefined" || typeof(project.property.keyword) === "undefined" || project.property.keyword.length == 0) {
        throw new Error("Invalid project keyword");
    };

    // Get values and cache hit
    const _slide = project.property.slides;
    const _query = project.property.keyword;
    const _cache = Cache.Hit(_query, "image");

    // Check if the cache exists
    if(_cache == null) {

        // Log
        console.log("Service/Asset/FetchExternalImage(): NO CACHE FOUND");

        //
        const _response = await axios.get("https://pixabay.com/api/", {
            params: {
                key: process.env.PIXABAY_API,
                q: _query,
                per_page: _slide.length + 10,
            },
        });

        //
        console.log(`Service/Asset/FetchExternalImage(): Rate Limit: ${_response.headers["x-ratelimit-limit"]}`);
        console.log(`Service/Asset/FetchExternalImage(): Rate Limit Remaining: ${_response.headers["x-ratelimit-reset"]}`);
        console.log(`Service/Asset/FetchExternalImage(): Rate Limit Resets in: ${_response.headers["x-ratelimit-remaining"]} seconds`);

        // Log for result
        if(_response.data.hits.length < _slide.length) {
            console.log("Service/Asset/FetchExternalImage(): Mismatch slides and default images");
        };

        // Check for images and add it to array
        const _image = [];
        for(var i = 0, len = _slide.length; i < len; i++) {

            if(typeof(_response.data.hits[i]) === "undefined") {
                console.log("Service/Asset/FetchExternalImage(): Invalid response hit at index", i);
                break;
            };

            if(typeof(_slide[i].image) === "undefined" || _slide[i].image.length == 0) {
                continue;
            };

            _image.push({
                url: _response.data.hits[i].largeImageURL,
                name: `${crypto.randomUUID()}.jpg`
            });

        };

        // 
        Cache.Update(_query, "image", _image);
        console.log("Service/Asset/FetchExternalImage(): CACHE UPDATED");

        //
        await Cache.Save();
        console.log("Service/Asset/FetchExternalImage(): CACHE SAVED");

        //
        await DownloadImage(_image);

        //
        await CropImage(_image, projectId, project);

    }
    else {

        console.log("Service/Asset/GetLocalAsset(): CACHE FOUND");

        //
        if(_cache.length < _slide.length) {
            console.log("Service/Asset/GetLocalAsset(): Mismatch slides and default images");
        };

        //
        const _image = [];
        for(var i = 0, len = _slide.length; i < len; i++) {

            // Check if the image is invalid
            if(typeof(_slide[i].image) === "undefined" || _slide[i].image.length == 0) {
                continue;
            };

            // If cache is invalid then generate random image
            if(typeof(_cache[i]) === "undefined") {

                _image.push(_cache[0]);
                console.log("Service/Asset/GetLocalAsset(): Invalid cache hit at index", i, " using random index", 0);
                
                continue;

            };

            _image.push(_cache[i]);

        };

        //
        await CropImage(_image, projectId, project);

    };

};


/**
    * Download the image for the slides
    * @param {string} projectId 
    * @param {*} project 
*/
async function GetExternalAsset(projectId, project = {}, callback) {

    // Log
    callback("Asset: Fetching external assets");

    // Try and fetch assets
    try {

        // Fetch images ad add it to project
        await FetchExternalImage(projectId, project);

    }
    catch(error) {
        console.log("Asset/GetExternalAsset():", error);
    };

};


/**
    * Create voice for the project
    * @param {string} projectId The project id to locate the project directory
    * @param {boolean} useLocalTTS Use local TTS, by default its set to `true`
*/
async function CreateVoiceAsset(projectId = "", slide = [], useLocalTTS = true, callback) {

    // Log
    callback("Asset: Creating voice files");

    // Try and create narration for video
    try {

        // Select service for the TTS
        if(useLocalTTS) {
            await Voice.ByLocalTTS(projectId, slide);
        }
        else {
            await Voice.ByExternalTTS(projectId, slide);
        };

    }
    catch(error) {
        console.log("Service/Asset.CreateVoiceAsset(): General error", error);
        throw error;
    };

};


export default { Uploader, GetLocalAsset, CreateVoiceAsset, GetExternalAsset, Cache };