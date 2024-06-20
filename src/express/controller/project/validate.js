import { DoesProjectExists, ReadProject } from "../../service/project.js";


/**
    * Validates project IDs from request query
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Validate(request, response) {

    // Create response object
    const _response = { message: "", success: false, data: [] };
    
    // Try and validate each projects
    try {

        // Check if the query parameter are valid
        const _projectId = JSON.parse(request.query.pid);
        if(_projectId == null || !Array.isArray(_projectId)) {
            throw new Error("No project IDs provided");
        };

        // Validate each project ID
        for(const projectId of _projectId) {
            if(typeof projectId !== "string" || projectId.length < 2) {
                throw new Error(`Invalid project ID: ${projectId}`);
            };
        };

        // Validate each project ID
        for(const projectId of _projectId) {
            if(await DoesProjectExists(projectId)) {
                const project = await ReadProject(projectId);
                _response.data.push({ id: projectId, ... project });
            };
        };

        // Set success response
        _response.success = true;
        
    }
    catch(error) {

        // Set error message
        _response.message = error.message || "An error occurred";

        // Log error message
        console.log("/project/validate:", error);

    }
    finally {
        
        // Send response
        response.send(_response);

    };

};