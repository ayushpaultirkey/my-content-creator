import { CreateProject } from "../../service/project.js";


/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Create(request, response) {

    //Create response object
    const _response = { message: "", success: false, data: {} };
    
    //Create project
    try {

        // Get query parameter
        let _width = request.query.width;
        let _height = request.query.height;
        let _prompt = request.query.prompt;

        // Check if the query parameter are valid
        if(typeof(_prompt) === "undefined" || _prompt.length < 2) {
            throw new Error("No project description provided");
        };
        if(typeof(_width) === "undefined" || _width < 128) {
            _width = 720;
        };
        if(typeof(_height) === "undefined" || _height < 128) {
            _height = 1280;
        };

        // Create new project
        const _project = await CreateProject(_prompt, _width, _height);

        // Set success respones
        _response.success = true;
        _response.data = _project;
        _response.message = "Project created successfully";
        
    }
    catch(error) {

        // Set error message
        _response.message = error.message || "An error occurred";

        // Log error message
        console.log("/project/create:", error);

    }
    finally {

        // Send response
        response.send(_response);

    };

};