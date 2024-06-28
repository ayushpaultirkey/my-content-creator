import Google from "../../../../service/google.js";
import Drive from "../../../../service/google/drive.js";


/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Import(request, response) {
    
    // Create response body
    const _response = { message: "", success: false };

    // Try and get google drive files
    try {

        // Check if there is user
        if(!Google.HasAuthToken(request)) {
            throw new Error("Google account not authenticated");
        };

        // Check if the query parameter are valid
        const _projectId = request.query.pid;
        const _fileId = JSON.parse(request.query.fid);

        if(typeof(_projectId) === "undefined" || _projectId == null) {
            throw new Error("No project id is defined");
        };
        if(_fileId == null || !Array.isArray(_fileId)) {
            throw new Error("No file id is defined");
        };

        // Download files into the project directory
        await Drive.ImportFile(_projectId, _fileId);

        // Set response data
        _response.success = true;
        
    }
    catch(error) {

        // Log error message
        console.log("/google/drive/getfiles:", error);

        // Set error message
        _response.message = error.message || "An error occurred";

    }
    finally {

        // Send response
        response.send(_response);

    };

};