import chalk from "chalk";
import Asset from "#service/asset.js";
import Analytics from "#service/analytics.js";


/**
    *
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Prompt(request, response) {

    //Create response object
    const _response = { message: "", success: false, data: {} };
    
    try {

        // Use multer to handle file uploads
        Asset.Uploader(request, response, async(error) => {
            try {

                // An error occurred when uploading.
                if(error) {
                    throw new Error(error.message);
                };

                //
                const { cookies, query, files } = request;
                const { uid } = cookies;
                const { q } = query;
                if(!uid) {
                    throw new Error("Invalid resource id");
                };
                const _file = (files && files.length > 0) ? files[0] : null;

                // Check for prompt and file
                if(!_file && (!q || q.trim().length < 5)) {
                    throw new Error("Please enter either prompt or attach file");
                };

                //
                const _data = await Analytics.Prompt({
                    file: _file,
                    prompt: q,
                    rid: uid,
                    callback: () => {}
                });

                // Set the response data
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