import chalk from "chalk";
import Google from "#service/google.js";


/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function GetFile(request, response) {
    
    // Create response body
    const _response = { message: "", success: false, data: null };

    try {

        // Check if the user is logged-in
        // with their google account
        if(!Google.Auth.HasToken(request)) {
            throw new Error("Google account not authenticated");
        };

        // Get next page token for the google drive
        const { next } = request.query;

        // Get files from drive
        const _data = await Google.Drive.GetFiles({
            request: request,
            nextPage: (next ? next : null),
            callback: () => {}
        });

        // Set response data
        _response.data = _data;
        _response.success = true;
        
    }
    catch(error) {

        // Log error message
        _response.message = error.message || "An error occurred";
        console.log(chalk.red("/google/drive/getfiles:"), error);

    }
    finally {

        // Send response
        response.send(_response);

    };

};