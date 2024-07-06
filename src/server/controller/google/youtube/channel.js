import Auth from "#service/google/auth.js";
import Youtube from "#service/google/youtube.js";


/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Channel(request, response) {
    
    //
    const _response = { message: "", success: false, data: null };

    //
    try {

        // Check if there is user
        if(!Auth.HasToken(request)) {
            throw new Error("Google account not authenticated");
        };

        // Get files from drive
        const _data = await Youtube.Channel({
            callback: () => {
                
            }
        });

        // Set response data
        _response.data = _data;
        _response.success = true;
        
    }
    catch(error) {

        // Log error message
        console.log("/google/youtube/channel:", error);

        // Set error message
        _response.message = error.message || "An error occurred";

    }
    finally {

        // Send response
        response.send(_response);

    };

};