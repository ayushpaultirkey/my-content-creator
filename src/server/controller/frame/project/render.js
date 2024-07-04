import Frame from "#service/frame.js";


/**
    * Validates project IDs from request query
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Render(request, response) {

    //
    const _response = { message: "", success: false, finished: false, url: "" };
    
    //
    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Connection", "keep-alive");
    response.setHeader("Content-Encoding", "none");

    //
    try {

        //
        const { pid } = request.query;
        if(!pid) {
            throw new Error("Invalid project id");
        };

        //
        const _fileName = await Frame.Project.Render({
            projectId: pid,
            callback: (text) => {

                response.write(`data: ${JSON.stringify({ message: text, success: true })}\n\n`);
                
            }
        });

        //
        _response.message = "Rendering finished";
        _response.url = `/project/${_projectId}/export/${_fileName}`;
        _response.success = true;
        _response.finished = true;

    }
    catch(error) {

        // Log and set response
        console.log("/project/export:", error);
        _response.message = error.message || "An error occurred";

    }
    finally {
        
        // End response
        response.write(`data: ${JSON.stringify(_response)}\n\n`);
        response.end();

    };

};