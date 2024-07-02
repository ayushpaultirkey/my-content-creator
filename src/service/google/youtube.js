import "dotenv/config";
import fs from "fs";
import mime from "mime";
import { google } from "googleapis";

import Google from "../google.js";
import Project from "../project.js";

async function UploadFile({ projectId = "", title, description, category = 24 }, callback) {

    try {

        // Log
        console.log("Service/Google/Youtube.UploadFile(): Upload started");
        callback("Youtube: Upload started");

        // Get project data and export data
        const _project = await Project.GetActive(projectId);
        const _exportFile = await Project.Export.GetFile(projectId);

        // Check file type
        const _mimetype = mime.getType(_exportFile.path);
        if(!_mimetype.includes("video")) {
            throw new Error("File format not supported");
        };

        // Get auth cient and define google drive
        const _auth = Google.OAuth2Client();
        const _youtube = google.youtube({ version: "v3", auth: _auth });

        // Define video metadata
        const _metadata = {
            snippet: {
            title: (title && title.length > 2) ? title : _project.property.title,
            description: (description && description.length > 2) ? description : _project.property.description,
                categoryId: category,
            },
            status: {
                privacyStatus: "private",
            },
        };

        // Get file size and set byte uploaded
        let _fileSize = fs.statSync(_exportFile.path).size;
        let _bytesUploaded = 0;

        // Create media object for upload along with
        // Upload progress function
        const _media = {
            mimeType: _mimetype,
            body: fs.createReadStream(_exportFile.path).on("data", (chunk) => {

                _bytesUploaded += chunk.length;
                const _progress = Math.round((_bytesUploaded / _fileSize) * 100);

                console.log(`Service/Google/Youtube.UploadFile(): Uploaded ${_progress}%`);
                callback(`Youtube: Upload progress: ${_progress}%`);

            })
        };

        // Upload the video
        await _youtube.videos.insert({
            part: 'snippet,status',
            resource: _metadata,
            media: _media,
        });
        
        // Log
        console.log("Service/Google/Youtube.UploadFile(): Upload finished");
        callback("Youtube: Upload finished");

    }
    catch(error) {

        console.log("Service/Google/Youtube.UploadFile():", error);
        throw error;

    };

};

export default { UploadFile };