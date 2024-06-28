import { HasAuthToken } from "../../../../service/google.js";
import { GetFiles } from "../../../../service/google/drive.js";


/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function GetFile(request, response) {
    
    // Create response body
    const _response = { message: "", success: false, data: [] };

    // Try and get google drive files
    try {

        // Check if there is user
        if(!HasAuthToken(request)) {
            throw new Error("Google account not authenticated");
        };

        // Get files from drive
        const _data = await GetFiles();

        // Set response data
        _response.data = _data;
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