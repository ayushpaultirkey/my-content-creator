import path from "path";
import sharp from "sharp";
import fs from "fs/promises";
import chalk from "chalk";

import Asset from "#service/asset.js";
import Project from "#service/frame/project.js";

/**
    * Validates project IDs from request query
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Upload(request, response) {

    //
    let _response = { message: "", success: false, data: {} };


    try {

        //
        const { pid } = request.query;
        if(!pid) {
            throw new Error("Invalid project id");
        };

        //
        Asset.Uploader(request, response, async(error) => {
            try {

                // An error occurred when uploading.
                if(error) {
                    throw new Error(error.message);
                };

                const { files } = request;

                if(!files || files.length === 0) {
                    throw new Error("No files uploaded");
                };

                //
                const _project = await Project.Read(pid);
                const _projectPath = Project.Path(pid);

                //
                await Promise.all(files.map(async(file) => {

                    //
                    const _inPath = file.path;
                    const _extension = path.extname(_inPath);

                    const _outPath = path.join(_projectPath, `/asset/${crypto.randomUUID()}${_extension}`);

                    //
                    if(file.mimetype.startsWith("image/")) {

                        //
                        await sharp(_inPath)
                        .resize({
                            width: (_project.config.width * 1),
                            height: (_project.config.height * 1),
                            fit: 'cover'
                        })
                        .toFile(_outPath);
    
                    }
                    else {

                        //
                        await fs.copyFile(_inPath, _outPath);

                    };

                }));

                //
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