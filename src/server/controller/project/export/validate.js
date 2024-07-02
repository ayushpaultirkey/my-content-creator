import fs from "fs/promises";
import path from "path";

import Project from "#service/project.js";
import Export from "#service/project/export.js";

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

        // Get the export file path of the project
        const _exportPath = await Export.GetFile(_projectId);

        // Set response
        _response.success = true;
        _response.url = _exportPath.url;

    }
    catch(error) {

        // Log and set response
        console.log("/project/export/validate:", error);
        _response.message = "Export file not found, or error occured.";

    }
    finally {
        
        // Send response
        response.send(_response);

    };

};