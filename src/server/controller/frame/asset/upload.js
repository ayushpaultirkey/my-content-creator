import path from "path";
import sharp from "sharp";
import fs from "fs/promises";
import chalk from "chalk";

import Asset from "#service/asset.js";
import Project from "#service/frame/project.js";


/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Upload(request, response) {

    // Create response body
    let _response = { message: "", success: false, data: {} };

    try {

        // Check for query strings
        const { pid } = request.query;
        if(!pid) {
            throw new Error("Invalid project id");
        };

        // Use multer to handle file uploads and upload them
        // to .temp folder of the project
        Asset.Uploader(request, response, async(error) => {
            try {

                // An error occurred when uploading
                if(error) {
                    throw new Error(error.message);
                };

                // Get files from the request and check
                // if those are valid
                const { files } = request;

                if(!files || files.length === 0) {
                    throw new Error("No files uploaded");
                };

                // Get the project data and its path
                const _project = await Project.Read(pid);
                const _projectPath = Project.Path(pid);

                // Loop over all files and move them to from
                // .temp to project's folder
                await Promise.all(files.map(async(file) => {

                    // Get original path and the project path
                    const _inPath = file.path;
                    const _extension = path.extname(_inPath);
                    const _outPath = path.join(_projectPath, `/asset/${crypto.randomUUID()}${_extension}`);

                    // If its image then crop the image to match the
                    // resolution of video, else copy directly
                    if(file.mimetype.startsWith("image/")) {

                        await sharp(_inPath)
                        .resize({
                            width: (_project.config.width * 1),
                            height: (_project.config.height * 1),
                            fit: 'cover'
                        })
                        .toFile(_outPath);
    
                    }
                    else {

                        await fs.copyFile(_inPath, _outPath);

                    };

                }));

                // Set new response data
                _response.message = "Files uploaded successfully";
                _response.success = true;

            }
            catch (error) {
                        
                // Set error message
                _response.message = error.message || "Unable to upload asset";
                console.log(chalk.red("/frame/asset/upload:"), "Upload error", error);

            }
            finally {

                // Send response
                response.send(_response);

            };
        });

    }
    catch(error) {

        // Set error message
        _response.message = error.message || "Unable to upload asset";
        console.log(chalk.red("/frame/asset/upload:"), error);

    };

};