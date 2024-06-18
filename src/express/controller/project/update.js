import { UpdateProject, UpdateProjectX } from "../../service/project.js";

/**
    * Validates project IDs from request query
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Update(request, response) {

    // Create response body
    const _response = { message: "", success: false, data: {} };
    
    //
    try {

        // Check if the query parameter are valid
        const _projectId = request.query.pid;

        // Check if the query parameter are valid
        if((typeof(_projectId) !== "string" || _projectId.length < 2)) {
            throw new Error("Invalid project id");
        };

        // Check if the image is valid else set to default value
        let _projectImage = request.query.pimage;
        if(_projectImage == null || !Array.isArray(_projectImage)) {
            _projectImage = [];
        };

        // Check if the audio is valid else set to default value
        let _projectAudio = request.query.paudio;
        if((typeof(_projectAudio) !== "string" || _projectAudio.length < 2)) {
            _projectAudio = "";
        };

        // Update slide by using the prompt
        const _project = await UpdateProjectX(_projectId, `Override the background image to "${_projectImage}".`);

        // Update response body
        _response.success = true;
        _response.data = { id: _projectId, ... _project };

    }
    catch(error) {

        // Set error message
        _response.message = error.message || "An error occurred";

    }
    finally {
        
        // Send response
        response.send(_response);

    };

};