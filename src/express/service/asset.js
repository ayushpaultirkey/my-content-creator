import say from "say";
import path from "path";
import axios from "axios";
import multer from "multer";
import fs from "fs/promises";
import mime from "mime-types";

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
                await fs.mkdir(_projectPath, { recursive: true });
                
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
async function GetAssetList(projectId = "") {

    try {
        
        // Get current directory path
        const { __dirname } = directory();

        // Get project path and read the project json file
        const _path = path.join(__dirname, `../../public/project/${projectId}/asset/`);

        // Get files
        const _files = await fs.readdir(_path);
        const _fileList = [];

        // Iterate for each file
        for(const file of _files) {

            const _filePath = path.join(_path, file);
            const _fileStat = await fs.stat(_filePath);
      
            if(_fileStat.isFile()) {

                const _mime = mime.lookup(_filePath);
              
                // Check if the file is an image, video, or audio
                if(_mime && (_mime.startsWith('image/') || _mime.startsWith('video/') || _mime.startsWith('audio/'))) {
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
    * Download the image for the slides
    * @param {string} projectId 
    * @param {*} project 
*/
async function FetchImage(projectId, project = {}) {

    // Try and download image
    try {

        // Get project path and update the project json file
        const _path = GetProjectPath(projectId);
        const _slides = project.property.slides;
    
        // Promise array for downloading image
        const _promise = [];
    
        // Download image function
        const _download = async(url, filePath) => {
            const _response = await axios({
                url: url,
                responseType: 'stream',
            });
            return new Promise((resolve, reject) => {
                _response.data.pipe(fs.createWriteStream(filePath)).on("finish", () => resolve()).on("error", error => reject(error));
            });
        };
    
        // Get slides and download image
        for(var i = 0, l = _slides.length; i < l; i++) {
    
            if(typeof(_slides[i].image) === "undefined" || _slides[i].image == null || _slides[i].image.length == 0) {
                continue;
            };
    
            const _url = `https://picsum.photos/${project.config.width}/${project.config.height}?random=${i}`;
            const _imagePath = path.join(_path, `/asset/${_slides[i].image[0]}.jpg`);
            _promise.push(_download(_url, _imagePath));
    
        };
    
        // Wait for all images to download
        await Promise.all(_promise);
        console.log("DownloadImage(): All images downloaded");

    }
    catch(error) {
        console.log("DownloadImage(): General error", error);
        throw error;
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


export { Uploader, GetAssetList, CreateVoice, FetchImage };