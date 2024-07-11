import chalk from "chalk";
import Auth from "#service/google/auth.js";
import Analytics from "#service/analytics.js";


/**
    *
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Report(request, response) {

    // Create response body
    const _response = { message: "", success: false, data: {} };

    //
    try {

        // Check for cookies and query strings
        const { uid } = request.cookies;
        const { refresh } = request.query;
        if(!uid) {
            throw new Error("Invalid reference id");
        };

        // Check if the user is logged-in
        // with their google account
        if(!Auth.HasToken(request)) {
            throw new Error("Google account not authenticated");
        };

        // Get the channel report or make a new one
        let _data = await Analytics.Report({
            request: request,
            refresh: refresh,
            rid: uid,
            callback: () => {
                
            }
        });

        // Set new response data
        _response.data = _data;
        _response.success = true;

    }
    catch(error) {

        // Log and set response for error
        console.log(chalk.red("/analytics/report:"), error);
        _response.message = error.message || "An error occurred";

    }
    finally {

        // Send response
        response.send(_response);

    };

};