import path from "path";
import sharp from "sharp";
import fs from "fs/promises";

import Asset from "../../../service/asset.js";
import Project from "../../../service/frame/project.js";

/**
    * Validates project IDs from request query
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Upload(request, response) {

    // Create response body
    let _response = { message: "", success: false, data: {} };

    // Try and upload the asset
    try {

        // Check if the query parameter are valid
        const _projectId = request.query.pid;
        if((typeof(_projectId) !== "string" || _projectId.length < 2)) {
            throw new Error("Invalid project id");
        };

        // Read project file
        const _project = await Project.GetActive(_projectId);

        // Use multer to handle file uploads
        Asset.Uploader(request, response, async(error) => {
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

                    // Get the uploaded file path
                    const _path = file.path;
                    const _extension = path.extname(_path);
                    const _destination = path.join(Project.Path(_projectId), `/asset/${crypto.randomUUID()}${_extension}`);

                    // Crop all images to match video dimension
                    if(file.mimetype.startsWith("image/")) {

                        // Resize image to width and height according to video dimension
                        await sharp(_path)
                        .resize({
                            width: (_project.config.width * 1),
                            height: (_project.config.height * 1),
                            fit: 'cover'
                        })
                        .toFile(_destination);
    
                    }
                    else {

                        // Copy file to project folder
                        await fs.copyFile(_path, _destination);

                    };

                }));

                // Set the response data
                _response.message = "Files uploaded successfully";
                _response.success = true;

            }
            catch (error) {
                        
                // Set error message
                _response.message = error.message || "Unable to upload asset";

                // Log error message
                console.log("/asset/upload: Upload error", error);

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
        
        // Log error message
        console.log("/asset/upload: General error", error);

    };

};