import chalk from "chalk";
import Auth from "#service/google/auth.js";
import Drive from "#service/frame/drive.js";


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

        const { pid } = request.query;

        // Check if the query parameter are valid
        if(!pid) {
            throw new Error("Invalid project id");
        };

        // Using project id, try to upload the render.mp4 file to drive
        // Create callback for the server side event
        await Drive.UploadFile({
            request: request,
            projectId: pid,
            callback: (text) => {

                response.write(`data: ${JSON.stringify({ message: text, success: true })}\n\n`);
    
            }
        });

        // Set response
        _response.message = "File uploaded to google drive";
        _response.finished = true;
        _response.success = true;

    }
    catch(error) {

        // Log and set response
        console.log(chalk.red("/frame/drive/upload:"), error);
        _response.message = error.message || "An error occurred";

    }
    finally {

        response.write(`data: ${JSON.stringify(_response)}\n\n`);
        response.end();

    };

};