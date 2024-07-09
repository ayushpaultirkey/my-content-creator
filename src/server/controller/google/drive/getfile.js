import Google from "#service/google.js";


/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function GetFile(request, response) {
    

    const _response = { message: "", success: false, data: null };

    
    try {

        // Check if there is user
        if(!Google.Auth.HasToken(request)) {
            throw new Error("Google account not authenticated");
        };

        //
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
        console.log("/google/drive/getfiles:", error);

        // Set error message
        _response.message = error.message || "An error occurred";

    }
    finally {

        // Send response
        response.send(_response);

    };

};