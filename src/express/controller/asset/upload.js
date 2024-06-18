import path from "path";
import sharp from "sharp";
import fs from "fs/promises";

import { Uploader } from "../../service/asset.js";
import { ReadProject } from "../../service/project.js";

/**
    * Validates project IDs from request query
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Upload(request, response) {

    // Create response body
    let _response = { message: "", success: false, data: {} };

    try {

        // Get project is from query string
        const _projectId = request.query.pid;
        if(!_projectId) {
            throw new Error("Project ID is required");
        };

        // Read project file
        const _project = await ReadProject(_projectId);

        // Use multer to handle file uploads
        Uploader(request, response, async(error) => {

            try {

                // An error occurred when uploading.
                if(error) {
                    throw new Error(error.message);
                };

                // Check if there are any files
                if(!request.files || request.files.length === 0) {
                    throw new Error("No files uploaded");
                };

                // Process files here, e.g., resize images using sharp
                await Promise.all(request.files.map(async (file) => {

                    //
                    const _path = file.path;

                    // Resize image to width and height according to video dimension
                    await sharp(_path)
                    .resize({
                        width: _project.config.width,
                        height: _project.config.height,
                        fit: 'cover'
                    })
                    .toFile(_path.replace(path.extname(_path), 'P' + path.extname(_path)));

                    // Optionally, you can delete the original file after processing
                    await fs.unlink(_path);

                }));

                // Set the response data
                _response.message = `Files uploaded successfully in ${_project.title}`;
                _response.success = true;

            }
            catch (error) {
                
                // Set error message
                _response.message = error.message || "An error occurred";

            }
            finally {

                // Send response
                response.send(_response);

            };

        });

    }
    catch(error) {

        // Set error message
        _response.message = error.message || "An error occurred";
        response.send(_response);
        
    };

};