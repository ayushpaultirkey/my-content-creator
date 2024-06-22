import "dotenv/config";
import say from "say";
import path from "path";
import axios from "axios";
import multer from "multer";
import sharp from "sharp";
import fs from "fs";
import fsp from "fs/promises";
import mime from "mime-types";

import { CacheHit, CachePath, SaveCache, UpdateCache } from "./cache.js";
import directory from "../../library/directory.js";
import { GetProjectPath } from "./project.js";


/**
    * 
*/
const Uploader = multer({
    storage: multer.diskStorage({
        destination: async(request, file, callback) => {

            try {

                // Get project is from query string
                const _projectId = request.query.pid;
                const { __dirname } = directory();

                // Check if the project id is valid
                if(!_projectId) {
                    return callback(new Error("Project ID is required"));
                };
          
                // Create project path
                const _projectPath = path.resolve(__dirname, `../../public/project/${_projectId}/asset`);
                await fsp.mkdir(_projectPath, { recursive: true });
                
                callback(null, _projectPath);

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

        if(file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
            callback(null, true);
        }
        else {
            callback(new Error("Only images and video are allowed!"), false);
        };

    }
}).array("files", 20);


/**
    * Get the list of assets
    * @param {string} projectId 
    * @returns 
*/
async function FetchAsset(projectId = "") {

    try {
        
        // Get current directory path
        const { __dirname } = directory();

        // Get project path and read the project json file
        const _path = path.join(__dirname, `../../public/project/${projectId}/asset/`);

        // Get files
        const _files = await fsp.readdir(_path);
        const _fileList = [];

        // Iterate for each file
        for(const file of _files) {

            const _filePath = path.join(_path, file);
            const _fileStat = await fsp.stat(_filePath);
      
            if(_fileStat.isFile()) {

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
        console.error(`GetAssetList(): Error reading directory for project ${projectId}:`, error);
        throw error;
    };

}


/**
    * 
    * @param {*} images 
    * @param {*} projectId 
    * @param {*} project 
*/
async function CropImage(images = [], projectId, project = []) {

    try {

        let _slide = project.property.slides;
        let _promise = [];

        // Crop image function
        const _crop = async(image, index) => {
            return new Promise(async(resolve, reject) => {

                if(typeof(_slide[index]) !== "undefined" && _slide[index].image.length !== 0) {

                    const inputPath = path.join(CachePath(), image.name);
                    const outputPath = path.join(GetProjectPath(projectId), `/asset/${_slide[index].image[0].name}`);
        
                    await sharp(inputPath)
                    .resize({
                        width: (project.config.width * 1),
                        height: (project.config.height * 1),
                        fit: "cover"
                    })
                    .toFile(outputPath)
                    .then(resolve)
                    .catch(reject);

                    console.log(`Asset/CropImage(): Image cropped ${outputPath}`);

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


async function DownloadImage(image = [{ url, name }]) {

    // Try and download image
    try {

        // Ensure cache directory exists
        const _cachePath = CachePath();
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
    
            const _imagePath = path.join(_cachePath, `/${image[i].name}`);

            _promise.push(_download(image[i].url, _imagePath));
    
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
    * Download the image for the slides
    * @param {string} projectId 
    * @param {*} project 
*/
async function FetchExternalAsset(projectId, project = {}) {

    try {

        //
        if(typeof(project.property) === "undefined" || typeof(project.property.keyword) === "undefined" || project.property.keyword.length == 0) {
            throw new Error("Invalid project keyword");
        };

        //
        const _slide = project.property.slides;
        const _query = project.property.keyword;
        const _cache = CacheHit(_query);

        //
        if(_cache == null) {
    
            //
            console.log("Asset/FetchAsset(): NO CACHE FOUND");
    
            //
            const _response = await axios.get("https://pixabay.com/api/", {
                params: {
                    key: process.env.PIXABAY_API,
                    q: _query,
                    per_page: _slide.length + 10,
                },
            });

            //
            console.log(`Asset/FetchAsset(): Rate Limit: ${_response.headers["x-ratelimit-limit"]}`);
            console.log(`Asset/FetchAsset(): Rate Limit Remaining: ${_response.headers["x-ratelimit-reset"]}`);
            console.log(`Asset/FetchAsset(): Rate Limit Resets in: ${_response.headers["x-ratelimit-remaining"]} seconds`);

            //
            if(_response.data.hits.length < _slide.length) {
                console.log("Asset/FetchAsset(): Mismatch slides and default images");
            };

            //
            const _image = [];
            for(var i = 0, len = _slide.length; i < len; i++) {

                if(typeof(_response.data.hits[i]) === "undefined") {
                    console.log("Asset/FetchAsset(): Invalid response hit at index", i);
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

            console.log(_query, _image)

            // 
            UpdateCache(_query, _image);
            console.log("Asset/FetchAsset(): CACHE UPDATED");

            //
            await SaveCache();
            console.log("Asset/FetchAsset(): CACHE SAVED");

            //
            await DownloadImage(_image);

            //
            await CropImage(_image, projectId, project);

        }
        else {

            console.log("Asset/FetchAsset(): CACHE FOUND");

            //
            if(_cache.length < _slide.length) {
                console.log("Asset/FetchAsset(): Mismatch slides and default images");
            };

            //
            const _image = [];
            for(var i = 0, len = _slide.length; i < len; i++) {

                if(typeof(_cache[i]) === "undefined") {
                    console.log("Asset/FetchAsset(): Invalid response hit at index", i, " using fallback index 0");
                    _image.push(_cache[0]);
                    continue;
                };

                if(typeof(_slide[i].image) === "undefined" || _slide[i].image.length == 0) {
                    continue;
                };

                _image.push(_cache[i]);

            };

            //
            await CropImage(_image, projectId, project);

        };

    }
    catch(error) {
        console.log("Asset/FetchAsset():", error);
    };

}


/**
    * Create voice for the slides
    * @param {string} projectId 
    * @param {[]} slide 
*/
async function CreateVoice(projectId = "", slide = []) {

    // Try and create narration for video
    try {

        // Get project path and update the project json file
        const _path = GetProjectPath(projectId);
    
        // Function to export spoken audio to a WAV file
        function _export(content, filePath) {
            return new Promise((resolve, reject) => {
                say.export(content, undefined, 1, filePath, (error) => {
                    if(error) {
                        reject(error);
                    }
                    else {
                        resolve();
                    };
                });
            });
        };
    
        // Create audio files for the slides
        for(var i = 0, l = slide.length; i < l; i++) {
    
            // Export spoken audio to a WAV file
            try {
                const _filePath = path.join(_path, `/asset/${slide[i].id}.wav`);
                await _export(slide[i].content, _filePath);
                console.log(`${slide[i].id} voice created`);
            }
            catch(error) {
                console.log(`CreateVoice(): Error creating voice for slide ${slide[i].id}:`, error);
            };
    
        };

    }
    catch(error) {
        console.log("CreateVoice(): General error", error);
        throw error;
    };

}


export { Uploader, FetchAsset, CreateVoice, FetchExternalAsset };