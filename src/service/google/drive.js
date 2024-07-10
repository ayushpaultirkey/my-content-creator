import "dotenv/config";
import fs from "fs";
import mime from "mime";
import path from "path";
import chalk from "chalk";
import crypto from "crypto";
import { google } from "googleapis";

import directory from "#library/directory.js";
import GAuth from "./auth.js";


const {  __root } = directory();


async function GetFiles({ nextPage = null, request, callback }) {

    try {

        // Get auth cient
        const _auth = GAuth.OAuth2Client(request);

        // Define google drive
        const _drive = google.drive({ version: "v3", auth: _auth });

        // Set filter for the files
        const _mimes = [
            "image/jpeg", "image/png", "image/gif", "image/bmp",
            "video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska"
        ];
        const _query = _mimes.map(mime => `mimeType="${mime}"`).join(" or ");

        // Get the files
        const _response = await _drive.files.list({
            q: _query,
            pageSize: 15,
            fields: "nextPageToken, files(id, name, mimeType, webViewLink)",
            pageToken: (nextPage) ? nextPage : null
        });

        // Retur
        return { files: _response.data.files, nextPage: _response.data.nextPageToken };

    }
    catch(error) {
        console.log(chalk.red("/S/Google/Drive.GetFiles():"), error)
        throw new Error("Unable to get files");
    };

};


async function ImportFiles({ request, id = [], callback }) {

    try {

        // const _project = await Project.GetActive(projectId);
        const _auth = GAuth.OAuth2Client(request);
        const _drive = google.drive({ version: "v3", auth: _auth });

        const _validated = [];

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
                
                    _writer.on("finish", () => {
                        _validated.push({
                            name: _name,
                            path: _tempPath,
                            mime: _mime
                        });
                        resolve();
                    });
                    _writer.on("error", reject);
    
                });
                
            }
            catch(error) {
                throw new Error(`Error downloading or processing file ${fileId}, ${error.message}`)
            };
            
        };
        
        const _promise = [];
        for(var i = 0, l = id.length; i < l; i++) {
            _promise.push(_download(id[i]));
        };
        
        await Promise.all(_promise);

        return _validated;

    }
    catch(error) {
        console.log(chalk.red("/S/Google/Drive.ImportFile():"), error);
        throw new Error("Unable to import files from drive");
    };

};


async function UploadFile({ filePath, request, callback }) {

    try {

        //
        console.log(chalk.green("/S/Google/Drive.UploadFile():"), "Upload started");
        callback("Drive: Upload started");

        // Get auth cient and define google drive
        const _auth = GAuth.OAuth2Client(request);
        const _drive = google.drive({ version: "v3", auth: _auth });

        // Create meta data for file
        const _metadata = {
            "name": path.basename(filePath)
        };
        const _mimeType = mime.getType(filePath);

        // Get file size and set byte uploaded
        let _fileSize = fs.statSync(filePath).size;
        let _bytesUploaded = 0;

        // Create media object for upload along with
        // Upload progress function
        const _media = {
            mimeType: _mimeType || "application/octet-stream",
            body: fs.createReadStream(filePath).on("data", (chunk) => {

                _bytesUploaded += chunk.length;

                const _progress = Math.round((_bytesUploaded / _fileSize) * 100);
                console.log(chalk.yellow("/S/Google/Drive.UploadFile():"), `Uploaded ${_progress}%`);
                callback(`Drive: Upload progress: ${_progress}%`);

            })
        };

        // Create new google drive file
        await _drive.files.create({
            resource: _metadata,
            media: _media,
            fields: "id"
        });
        
        // Log
        console.log(chalk.green("/S/Google/Drive.UploadFile():"), "Upload finished");
        callback("Drive: Upload finished");

    }
    catch(error) {
        console.log(chalk.red("/S/Google/Drive.UploadFile():"), error);
        throw new Error("Unable to upload file to drive");
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