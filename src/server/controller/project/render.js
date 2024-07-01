import Project from "#service/project.js";


/**
    * Validates project IDs from request query
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Render(request, response) {

    //Create response object
    const _response = { message: "", success: false };
    
    //Create project
    try {

        //Make a SSE
        response.setHeader("Content-Type", "text/event-stream");
        response.setHeader("Cache-Control", "no-cache");
        response.setHeader("Connection", "keep-alive");
        response.setHeader("Content-Encoding", "none");

        // Check if the query parameter are valid
        const _projectId = request.query.pid;
        if(typeof(_projectId) !== "string" || _projectId.length < 2) {
            throw new Error("Invalid project id");
        };

        // Render project and send live data
        let _fileName = await Project.Render(_projectId, (text) => {

            // Write response
            response.write(`data: ${JSON.stringify({ message: text, success: true })}\n\n`);

        });

        // Set success response
        _response.message = `/project/${_projectId}/export/${_fileName}`;
        _response.success = true;

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