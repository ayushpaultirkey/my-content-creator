import chalk from "chalk";
import Asset from "#service/asset.js";
import Analytics from "#service/analytics.js";


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

                // Check for cookies and query strings
                const { cookies, query, files } = request;
                const { uid } = cookies;
                const { q } = query;
                if(!uid) {
                    throw new Error("Invalid resource id");
                };
                const _file = (files && files.length > 0) ? files[0] : null;

                // Check is the prompt and the file are valid
                if(!_file && (!q || q.trim().length < 5)) {
                    throw new Error("Please enter either prompt or attach file");
                };

                // Generate answer based on the prompt
                const _data = await Analytics.Prompt({
                    file: _file,
                    prompt: q,
                    rid: uid,
                    callback: () => {}
                });

                // Set the new response data
                _response.message = "Project updated";
                _response.success = true;
                _response.data = _data;

            }
            catch (error) {
                        
                // Log and set error message
                _response.message = error.message || "Unable to upload asset";
                console.log(chalk.red("/analytics/prompt:"), "Upload error", error);

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
        console.log(chalk.red("/analytics/prompt:"), error);
        response.send(_response);

    };

};