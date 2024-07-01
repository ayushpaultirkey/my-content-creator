import fs from "fs/promises";
import path from "path";

import Project from "../../../../service/project.js";

/**
    *
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Validate(request, response) {
    
    // Create response object
    const _response = { message: "", success: false, url: "" };

    //Check if render.mp4 exists
    try {

        // Check if the query parameter are valid
        const _projectId = request.query.pid;
        if(!_projectId) {
            throw new Error("Invalid project id");
        };

        // Try to access render.mp4 file
        await fs.access(path.join(Project.Path(_projectId), "/render.mp4"));

        // Set response
        _response.success = true;
        _response.url = `/project/${_projectId}/render.mp4`;

    }
    catch(error) {

        // Log and set response
        console.log("/project/export/validate:", error);
        _response.message = error.message || "An error occurred";

    }
    finally {
        
        // Send response
        response.send(_response);

    };

};