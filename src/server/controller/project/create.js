import Asset from "../../../service/asset.js";
import Project from "../../../service/project.js";


let LISTNER = [];


function Send(data = {}) {
    LISTNER.forEach(x => {
        x.write(`data: ${JSON.stringify(data)}\n\n`);
    });
};


/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
function GCreate(request, response) {

    //Make a server send event
    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Connection", "keep-alive");
    response.setHeader("Content-Encoding", "none");

    LISTNER.push(response);

    request.on("close", () => {
        LISTNER = LISTNER.filter(x => x !== response);
    });

};


/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
async function PCreate(request, response) {

    //Create response object
    const _response = { message: "", success: false, finished: false, data: {} };
    

    //Create project
    try {

        // Send response
        response.sendStatus(200);

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

                // Create project and update response
                const _project = await Project.Create({ prompt: _prompt, file: _file, width: _width, height: _height }, (text) => {
                    Send({ message: text, success: true });
                });

                // Set the response data
                _response.message = "Project created";
                _response.finished = true;
                _response.success = true;
                _response.data = _project;

            }
            catch(error) {
                        
                // Log and set message
                _response.message = error.message || "Unable to upload asset";
                console.log("/project/create: Upload error", error);

            }
            finally {

                // End response
                Send(_response);

            };
        });

    }
    catch(error) {

        // Set error and log error
        console.log("/project/create:", error);
        response.sendStatus(500);

    };

};

export default { PCreate, GCreate }