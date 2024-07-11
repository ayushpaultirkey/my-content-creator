import chalk from "chalk";
import Frame from "#service/frame.js";


/**
    *
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Render(request, response) {

    // Create response body
    const _response = { message: "", success: false, finished: false, url: "" };
    
    // Set header for SSE
    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Connection", "keep-alive");
    response.setHeader("Content-Encoding", "none");

    try {

        // Check for query strings
        const { pid } = request.query;
        if(!pid) {
            throw new Error("Invalid project id");
        };

        // Start the render of the project and send response
        const _fileName = await Frame.Project.Render({
            projectId: pid,
            callback: (text) => {

                response.write(`data: ${JSON.stringify({ message: text, success: true })}\n\n`);
                
            }
        });

        // Set final response data
        _response.message = "Rendering finished";
        _response.url = `/project/${pid}/export/${_fileName}`;
        _response.success = true;
        _response.finished = true;

    }
    catch(error) {

        // Log and set response
        console.log(chalk.red("/frame/project/render:"), error);
        _response.message = error.message || "An error occurred";

    }
    finally {
        
        // End response
        response.write(`data: ${JSON.stringify(_response)}\n\n`);
        response.end();

    };

};