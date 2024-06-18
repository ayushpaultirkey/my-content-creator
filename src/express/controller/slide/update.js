import { UpdateSlide } from "../../service/slide.js";


/**
    * Validates project IDs from request query
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
async function Update(request, response) {

    // Create response body
    const _response = { message: "", success: false, data: {} };
    
    //
    try {

        // Check if the query parameter are valid
        const _projectId = request.query.pid;
        const _slideId = request.query.sid;

        const _slideContent = request.query.scontent;

        // Check if the query parameter are valid
        if(
            (typeof(_projectId) !== "string" || _projectId.length < 2) ||
            (typeof(_slideId) !== "string" || _slideId.length < 2) ||
            (typeof(_slideContent) !== "string" || _slideContent.length < 2)
        )
        {
            throw new Error("Invalid project slide parameter");
        };

        // Update slide by using the prompt
        const _project = await UpdateSlide(_projectId, `In slide "${_slideId}" change the content to "${_slideContent}"`);

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

export default Update;