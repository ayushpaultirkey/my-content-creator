/**
    * Validates project IDs from request query
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Export(request, response) {

    //Create response object
    const _response = { message: "", success: false, data: [] };
    
    //Create project
    try {

        // Check if the query parameter are valid
        const _projectId = request.query.id;
        if(typeof(_projectId) !== "string" || _projectId.length < 2) {
            throw new Error("Invalid project id");
        };

        // Set success response
        _response.success = true;
        
    }
    catch(error) {

        // Set error message
        _response.message = error.message || "An error occurred";

        // Log error message
        console.log("/project/export:", error);

    }
    finally {
        
        // Send response
        response.send(_response);

    };

};