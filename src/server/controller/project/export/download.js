import fs from "fs/promises";
import path from "path";

import Project from "#service/project.js";

/**
    *
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Download(request, response) {
    
    //Create project
    try {

        // Check if the query parameter are valid
        const _projectId = request.query.pid;
        if(!_projectId) {
            throw new Error("Invalid project id");
        };

        // Get rendered file path
        const _renderPath = path(Project.Path(_projectId), "/render.mp4");

        // Download file
        response.download(_renderPath);

    }
    catch(error) {

        // Log and set response
        console.log("/project/export/download:", error);
        response.status(500);
        response.send("Failed to download file, check if the project is rendered");

    };

};