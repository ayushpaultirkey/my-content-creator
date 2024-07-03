import ServerEvent from "#library/event.js";
import Asset from "../../../service/asset.js";
import Project from "../../../service/project.js";

/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
function GETCreate(request, response) {

    //Make a server send event
    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Connection", "keep-alive");
    response.setHeader("Content-Encoding", "none");

    ServerEvent.Register("PCreate", response);

    request.on("close", () => {
        ServerEvent.Filter("PCreate", response);
    });

};


/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
async function POSTCreate(request, response) {

    //Create response object
    const _response = { message: "", success: false, finished: false, data: {} };
    
    
    try {

        // Use multer to handle file uploads
        Asset.Uploader(request, response, async(error) => {
            try {

                // An error occurred when uploading.
                if(error) {
                    throw new Error(error.message);
                };

                // Send initial response
                response.sendStatus(200);

                // Get query parameter
                const { width, height, prompt, files } = request.query;
                const _file = (files && files.length > 0) ? files[0] : null;

                // Check for prompt and file
                if(!_file && (!prompt || prompt.trim().length < 5)) {
                    throw new Error("Please enter either prompt or attach file");
                };

                // Create project and update response
                const _project = await Project.Create({
                    prompt: prompt,
                    file: _file,
                    width: (!width || width < 128) ? 720 : width,
                    height: (!height || height < 128) ? 720 : height
                },
                (text) => {
                    ServerEvent.Write("PCreate", { message: text, success: true });
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
                ServerEvent.Write("PCreate", _response);

            };
        });

    }
    catch(error) {

        // Set error and log error
        console.log("/project/create:", error);
        response.sendStatus(500);

    };

};

export default { POSTCreate, GETCreate }