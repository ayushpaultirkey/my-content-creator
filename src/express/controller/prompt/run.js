import { UpdateSlide } from "../../service/slide.js";

/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Run(request, response) {

    //Create response object
    const _response = { message: "", success: false, data: "" };
    
    //Try and run prompt
    try {

        // Check if the query parameter are valid
        const _prompt = request.query.prompt;
        const _projectId = request.query.pid;
        if((typeof(_projectId) !== "string" || _projectId.length < 2) || (typeof(_prompt) !== "string" || _prompt.length < 2)) {
            throw new Error("Invalid parameters");
        };

        // Update slide by using the prompt
        const _project = await UpdateSlide(_projectId, _prompt);

        // Set success respones
        _response.success = true;
        _response.data = { id: _projectId, ... _project };
        
    }
    catch(error) {

        // Set error message
        _response.message = error.message || "An error occurred";

        // Log error message
        console.log("/prompt/run:", error);

    }
    finally {

        // Send response
        response.send(_response);

    };

};