import Project from "#service/project.js";
import Google from "#service/google.js";
import Youtube from "#service/google/youtube.js";

/**
    *
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function EYoutube(request, response) {
    
    // Create response object
    const _response = { message: "", success: false, finished: false };

    //Set response header for server send event
    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Connection", "keep-alive");
    response.setHeader("Content-Encoding", "none");

    //Check if render.mp4 exists
    try {

        // Check if there is user
        if(!Google.HasAuthToken(request)) {
            throw new Error("Google account not authenticated");
        };

        // Check if the query parameter are valid
        const { pid, t, d, c } = request.query;
        if(!pid || !t || !d || !c) {
            throw new Error("Invalid parameters");
        };

        // Using project id, try to upload the file to youtube
        // Create callback for the server side event
        await Youtube.UploadFile({ projectId: pid, title: t, description: d, category: c }, (text) => {

            // Write response
            response.write(`data: ${JSON.stringify({ message: text, success: true })}\n\n`);

        });

        // Set response
        _response.message = "File uploaded to youtube";
        _response.finished = true;
        _response.success = true;

    }
    catch(error) {

        // Log and set response
        console.log("/project/export/youtube:", error);
        _response.message = error.message || "An error occurred";

    }
    finally {

        response.write(`data: ${JSON.stringify(_response)}\n\n`);
        response.end();

    };

};