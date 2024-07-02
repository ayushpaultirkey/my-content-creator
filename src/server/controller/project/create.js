import Asset from "../../../service/asset.js";
import Project from "../../../service/project.js";

/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Create(request, response) {

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
                let _width = request.query.width;
                let _height = request.query.height;
                let _prompt = request.query.prompt;
                let _file = (request.files && request.files.length > 0) ? request.files[0] : null;

                // Check video dimension
                _width = (!_width || _width < 128) ? 720 : _width;
                _height = (!_height || _height < 128) ? 720 : _height;

                // Check for prompt and file
                if(_file == null && _prompt.length < 5) {
                    throw new Error("Please enter either prompt or attach file");
                };

                // Create project
                const _project = await Project.Create(_prompt, _file, _width, _height);

                // Set the response data
                _response.message = "Project created";
                _response.success = true;
                _response.data = _project;

            }
            catch (error) {
                        
                // Set error message
                _response.message = error.message || "Unable to upload asset";

                // Log error message
                console.log("/project/create: Upload error", error);

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
        console.log("/project/create:", error);

        // Send response
        response.send(_response);

    };

};