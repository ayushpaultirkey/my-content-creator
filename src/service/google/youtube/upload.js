import "dotenv/config";
import fs from "fs";
import mime from "mime";
import chalk from "chalk";
import { google } from "googleapis";

import Auth from "./../auth.js";


export default async function Upload({ request, filePath, title, description, category = 24, callback }) {

    try {

        if(!filePath || !title || !description || !category) {
            throw new Error("Invalid arguments");
        }

        // Log
        console.log(chalk.green("S/Google/Youtube.Upload():"), "Upload started");
        callback("Youtube: Upload started");

        // Check file type
        const _mimetype = mime.getType(filePath);
        if(!_mimetype.includes("video")) {
            throw new Error("File format not supported");
        };

        // Get auth cient and define google drive
        const _auth = Auth.OAuth2Client(request);
        const _youtube = google.youtube({ version: "v3", auth: _auth });

        // Define video metadata
        const _metadata = {
            snippet: {
                title: title,
                description: description,
                categoryId: category,
            },
            status: {
                privacyStatus: "private",
            },
        };

        // Get file size and set byte uploaded
        let _fileSize = fs.statSync(filePath).size;
        let _bytesUploaded = 0;

        // Create media object for upload along with
        // Upload progress function
        const _media = {
            mimeType: _mimetype,
            body: fs.createReadStream(filePath).on("data", (chunk) => {

                _bytesUploaded += chunk.length;
                const _progress = Math.round((_bytesUploaded / _fileSize) * 100);

                console.log(chalk.blue("S/Google/Youtube.Upload():"), `Uploaded ${_progress}%`);
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
        console.log(chalk.green("S/Google/Youtube.Upload():"), "Upload finished");
        callback("Youtube: Upload finished");

    }
    catch(error) {

        console.log(chalk.red("S/Google/Youtube.Upload():"), error);
        throw new Error("Unable to upload video to youtube");

    };

};