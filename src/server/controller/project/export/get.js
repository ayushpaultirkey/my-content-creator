import fs from "fs/promises";
import path from "path";

import Project from "#service/project.js";

/**
    *
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Get(request, response) {
    
    //Create project
    try {

        // Check if the query parameter are valid
        const _projectId = request.query.pid;
        if(!_projectId) {
            throw new Error("Invalid project id");
        };

        // Get the export file path of the project
        const _exportPath = await Project.Export.GetFile(_projectId);

        // Download file
        response.download(_exportPath.path);

    }
    catch(error) {

        // Log and set response
        console.log("/project/export/download:", error);
        response.status(500);
        response.send("Failed to download file, check if the project is rendered");

    };

};