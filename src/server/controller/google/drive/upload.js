import Google from "#service/google.js";


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
        if(!Google.Auth.HasToken(request)) {
            throw new Error("Google account not authenticated");
        };

        // Check if the query parameter are valid
        if(!request.query.pid) {
            throw new Error("Invalid project id");
        };

        // Using project id, try to upload the render.mp4 file to drive
        // Create callback for the server side event
        await Google.Drive.UploadFile(request.query.pid, (text) => {

            response.write(`data: ${JSON.stringify({ message: text, success: true })}\n\n`);

        });

        // Set response
        _response.message = "File uploaded to google drive";
        _response.finished = true;
        _response.success = true;

    }
    catch(error) {

        // Log and set response
        console.log("/project/export/drive:", error);
        _response.message = error.message || "An error occurred";

    }
    finally {

        response.write(`data: ${JSON.stringify(_response)}\n\n`);
        response.end();

    };

};