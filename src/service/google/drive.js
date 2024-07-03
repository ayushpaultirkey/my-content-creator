import "dotenv/config";
import fs from "fs";
import fsp from "fs/promises";
import mime from "mime";
import path from "path";
import sharp from "sharp";
import crypto from "crypto";
import { google } from "googleapis";

import directory from "#library/directory.js";
import GAuth from "./auth.js";
import Project from "../project.js";


const {  __root } = directory();


async function GetFiles() {

    try {

        // Get auth cient
        const _auth = GAuth.OAuth2Client();

        // Define google drive
        const _drive = google.drive({ version: "v3", auth: _auth });

        // Set filter for the files
        const _mimes = [
            "image/jpeg", "image/png", "image/gif", "image/bmp",
            "video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska"
        ];
        const _query = _mimes.map(mime => `mimeType="${mime}"`).join(" or ");

        // Get the files
        const _list = await _drive.files.list({
            q: _query,
            pageSize: 10,
            fields: "nextPageToken, files(id, name, mimeType, webViewLink)",
        });

        // Retur
        return _list.data.files;

    }
    catch(error) {
        console.log("Service/Google/Drive.GetFiles():", error)
        throw error;
    };

};


async function ImportFiles(projectId = "", id = []) {

    try {

        const _project = await Project.GetActive(projectId);

        const _auth = GAuth.OAuth2Client();
        const _drive = google.drive({ version: "v3", auth: _auth });

        const _download = async(fileId) => {

            try {

                // Get file
                const _response = await _drive.files.get({ fileId: fileId, alt: "media" }, { responseType: "stream" });
    
                // Get file meta data
                const _metadata = await _drive.files.get({ fileId: fileId, fields: "mimeType" });
                const _mime = _metadata.data.mimeType;
                const _extension = MimeTypeExtension(_mime);
                const _name = `${crypto.randomUUID()}.${_extension}`;
    
                // Create temp download path
                const _tempPath = path.join(__root, `/project/.temp/${_name}`);
    
                // Download file in the .download folder
                await new Promise((resolve, reject) => {
    
                    const _writer = fs.createWriteStream(_tempPath);
                    _response.data.pipe(_writer);
                
                    _writer.on("finish", resolve);
                    _writer.on("error", reject);
    
                });
                
                // Create project path for the assets when downloaded
                const _projectPath = path.join(Project.Path(projectId), `/asset/${_name}`);

                // Once downlaoded finally process if its image or copy the file to project
                if(_mime.startsWith("image/")) {

                    // Process image and move it to project asset folder
                    await sharp(_tempPath)
                    .resize({
                        width: (_project.config.width * 1),
                        height: (_project.config.height * 1),
                        fit: "cover"
                    })
                    .toFile(_projectPath);

                }
                else {

                    // Copy other asset to project folder
                    await fsp.copyFile(_tempPath, _projectPath);

                };

            }
            catch(error) {
                throw new Error(`Service/Google/Drive.ImportFile(): Error downloading or processing file ${fileId}, ${error.message}`)
            };
            
        };
        
        const _promise = [];
        for(var i = 0, l = id.length; i < l; i++) {
            _promise.push(_download(id[i]));
        };
        
        await Promise.all(_promise);

    }
    catch(error) {
        console.log("Service/Google/Drive.ImportFile():", error);
        throw error;
    };

};


async function UploadFile(projectId = "", sse) {

    try {

        // Create project path for the assets when downloaded
        const _filePath = await Project.Export.GetFile(projectId);

        // Log
        console.log("Service/Google/Drive.UploadFile(): Upload started");
        sse("Drive: Upload started");

        // Get auth cient and define google drive
        const _auth = GAuth.OAuth2Client();
        const _drive = google.drive({ version: "v3", auth: _auth });

        // Create meta data for file
        const _metadata = {
            "name": path.basename(_filePath.path)
        };
        const _mimeType = mime.getType(_filePath.path);

        // Get file size and set byte uploaded
        let _fileSize = fs.statSync(_filePath.path).size;
        let _bytesUploaded = 0;

        // Create media object for upload along with
        // Upload progress function
        const _media = {
            mimeType: _mimeType || "application/octet-stream",
            body: fs.createReadStream(_filePath.path).on("data", (chunk) => {

                _bytesUploaded += chunk.length;

                const _progress = Math.round((_bytesUploaded / _fileSize) * 100);
                console.log(`Service/Google/Drive.UploadFile(): Uploaded ${_progress}%`);
                sse(`Drive: Upload progress: ${_progress}%`);

            })
        };

        // Create new google drive file
        await _drive.files.create({
            resource: _metadata,
            media: _media,
            fields: "id"
        });
        
        // Log
        console.log("Service/Google/Drive.UploadFile(): Upload finished");
        sse("Drive: Upload finished");

    }
    catch(error) {
        console.log("Service/Google/Drive.UploadFile():", error);
        throw error;
    };

};


function MimeTypeExtension(mimeType = "") {

    const mimeTypes = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "image/bmp": "bmp",
        "video/mp4": "mp4",
        "video/quicktime": "mov",
        "video/x-msvideo": "avi",
        "video/x-matroska": "mkv"
    };
    const extenstion = "file";
    return mimeTypes[mimeType] || extenstion;

};



export default { GetFiles, ImportFiles, UploadFile };