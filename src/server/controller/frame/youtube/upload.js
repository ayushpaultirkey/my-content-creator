import chalk from "chalk";
import Auth from "#service/google/auth.js";
import Youtube from "#service/frame/youtube.js";

/**
    *
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Upload(request, response) {
    
    // Create response object
    const _response = { message: "", success: false, finished: false };

    //Set response header for server send event
    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Connection", "keep-alive");
    response.setHeader("Content-Encoding", "none");


    try {

        // Check if there is user
        if(!Auth.HasToken(request)) {
            throw new Error("Google account not authenticated");
        };

        // Check if the query parameter are valid
        // pid => project id
        // t => title
        // d => description
        // c => category
        const { pid, t, d, c } = request.query;
        if(!pid || !t || !d || !c) {
            throw new Error("Invalid parameters");
        };

        // Using project id, try to upload the render.mp4 file to youtube
        // Create callback for the server side event
        await Youtube.Upload({
            request: request,
            projectId: pid,
            title: t,
            category: c,
            description: d,
            callback: (text) => {
                response.write(`data: ${JSON.stringify({ message: text, success: true })}\n\n`);
            }
        });

        // Set response for success
        _response.message = "File uploaded to youtube";
        _response.finished = true;
        _response.success = true;

    }
    catch(error) {

        // Log and set response for error
        console.log(chalk.red("/frame/project/youtube/upload:"), error);
        _response.message = error.message || "An error occurred";

    }
    finally {

        // End response
        response.write(`data: ${JSON.stringify(_response)}\n\n`);
        response.end();

    };

};