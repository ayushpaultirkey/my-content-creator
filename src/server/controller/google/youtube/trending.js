import chalk from "chalk";
import Auth from "#service/google/auth.js";
import Youtube from "#service/google/youtube.js";


/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Trending(request, response) {
    
    // Create response body
    const _response = { message: "", success: false, data: null };

    try {

        // Check if the user is logged-in
        // with their google account
        if(!Auth.HasToken(request)) {
            throw new Error("Google account not authenticated");
        };

        // Get the region code
        const { region } = request.query;

        // Get trending data from youtube
        const _video = await Youtube.Trending({
            region: (region) ? region : "IN",
            request: request,
            callback: () => {

            }
        })

        // Set response data
        _response.data = _video;
        _response.success = true;
        
    }
    catch(error) {

        // Log error message
        _response.message = error.message || "An error occurred";
        console.log(chalk.red("/google/drive/trending:"), error);

    }
    finally {

        // Send response
        response.send(_response);

    };

};