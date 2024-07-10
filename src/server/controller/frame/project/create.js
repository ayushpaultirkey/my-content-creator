import chalk from "chalk";
import ServerEvent from "#library/event.js";
import Asset from "#service/asset.js";
import Frame from "#service/frame.js";


/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
function GETCreate(request, response) {

    //
    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Connection", "keep-alive");
    response.setHeader("Content-Encoding", "none");

    //
    ServerEvent.Register(Frame.Config.S_CREATE_SSE, response);

    //
    request.on("close", () => {
        ServerEvent.Filter(Frame.Config.S_CREATE_SSE, response);
    });

};


/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
async function POSTCreate(request, response) {

    //
    const _response = { message: "", success: false, finished: false, data: {} };
    
    try {

        //
        response.sendStatus(200);

        //
        Asset.Uploader(request, response, async(error) => {
            try {

                //
                if(error) {
                    throw new Error(error.message);
                };

                //
                const { files, query } = request;
                const { width, height, prompt } = query;
                const _file = (files && files.length > 0) ? files[0] : null;

                //
                if(!_file && (!prompt || prompt.trim().length < 5)) {
                    throw new Error("Please enter either prompt or attach file");
                };

                //
                const _project = await Frame.Project.Create({
                    file: _file,
                    prompt: prompt,
                    width: (!width || width < 128) ? 720 : width,
                    height: (!height || height < 128) ? 720 : height,
                    callback: (text) => {

                        ServerEvent.Write(Frame.Config.S_CREATE_SSE, { message: text, success: true });

                    }
                });

                //
                _response.message = "Project created";
                _response.finished = true;
                _response.success = true;
                _response.data = _project;

            }
            catch(error) {
                        
                //
                _response.message = error.message || "Unable to upload asset";
                console.log(chalk.red("/frame/project/create:"), "Upload error", error);

            }
            finally {

                //
                ServerEvent.Write(Frame.Config.S_CREATE_SSE, _response);

            }
        });

    }
    catch(error) {

        //
        console.log(chalk.red("/frame/project/create:"), error);
        response.sendStatus(500);

    };

};

export default { POSTCreate, GETCreate }