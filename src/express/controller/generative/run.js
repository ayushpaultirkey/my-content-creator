import { GenerativeRun } from "../../service/gemini.js";

/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Run(request, response) {

    //Create response object
    const _response = { message: "", success: false, data: "" };
    
    //Create project
    try {

        // Check if the query parameter are valid
        const _prompt = request.query.prompt;
        if(typeof(_prompt) == "undefined" || _prompt.length < 2) {
            throw new Error("No project description provided");
        };

        // 
        const _output = await GenerativeRun(_prompt);

        // Set success respones
        _response.success = true;
        _response.data = _output;
        
    }
    catch(error) {
        _response.message = error.message || "An error occurred";
    }
    finally {
        response.send(_response);
    };

};