import Project from "#service/project.js";
import Google from "#service/google.js";
import Drive from "#service/google/drive.js";

/**
    *
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function EDrive(request, response) {
    
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
        if(!request.query.pid) {
            throw new Error("Invalid project id");
        };

        // Get the export file path of the project and upload file to drive
        const _exportPath = await Project.Export.GetFile(request.query.pid);
        await Drive.UploadFile(_exportPath.path, (text) => {

            // Write response
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