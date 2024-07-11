import chalk from "chalk";
import Project from "#service/frame/project.js";
import Asset from "#service/asset.js";


/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Prompt(request, response) {

    // Create response body
    const _response = { message: "", success: false, data: {} };
    
    try {

        // Use multer to handle file uploads and upload them
        // to .temp folder of the project
        Asset.Uploader(request, response, async(error) => {
            try {

                // An error occurred when uploading
                if(error) {
                    throw new Error(error.message);
                };

                // Get files and query string from the request and check
                // if those are valid
                const { files, query } = request;
                const { pid, prompt } = query;

                if(!pid) {
                    throw new Error("Invalid project id");
                };

                const _file = (files && files.length > 0) ? files[0] : null;
                if(!_file && (!prompt || prompt.trim().length < 5)) {
                    throw new Error("Please enter either prompt or attach file");
                };

                // Update project by prompt and file
                const _project = await Project.Update({
                    projectId: pid,
                    prompt: prompt,
                    file: _file,
                    callback: () => {}
                });

                // Set the response data
                _response.message = "Project updated";
                _response.success = true;
                _response.data = { id: pid, ... _project };

            }
            catch (error) {
                        
                // Log and set error message
                _response.message = error.message || "Unable to upload asset";
                console.log(chalk.red("/frame/prompt:"), error);

            }
            finally {

                // Send response
                response.send(_response);

            };
        });

    }
    catch(error) {

        // Log ad set error message
        _response.message = error.message || "An error occurred";
        console.log(chalk.red("/frame/prompt:"), error);
        response.send(_response);

    };

};