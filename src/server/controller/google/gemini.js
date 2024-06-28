import Asset from "../../../service/asset.js";
import Slide from "../../../service/slide.js";


/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Gemini(request, response) {

    //Create response object
    const _response = { message: "", success: false, data: {} };
    
    //Create project
    try {

        // Use multer to handle file uploads
        Asset.Uploader(request, response, async(error) => {
            try {

                // An error occurred when uploading.
                if(error) {
                    throw new Error(error.message);
                };

                // Get query parameter
                let _projectId = request.query.pid;
                let _prompt = request.query.prompt;
                let _file = (request.files && request.files.length > 0) ? request.files[0] : null;

                // Check for prompt and file
                if(typeof(_projectId) === "undefined") {
                    throw new Error("Invalid project id");
                };

                // Check for prompt and file
                if(_file == null && _prompt.length < 5) {
                    throw new Error("Please enter either prompt or attach file");
                };

                // Create project
                const _project = await Slide.Update(_projectId, _prompt, _file);

                // Set the response data
                _response.message = "Project updated";
                _response.success = true;
                _response.data = { id: _projectId, ... _project };

            }
            catch (error) {
                        
                // Set error message
                _response.message = error.message || "Unable to upload asset";

                // Log error message
                console.log("/google/gemini: Upload error", error);

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

        // Log error message
        console.log("/google/gemini:", error);

        // Send response
        response.send(_response);

    };

};