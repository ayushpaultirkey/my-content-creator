import chalk from "chalk";
import Analytics from "#service/analytics.js";


/**
    *
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function History(request, response) {

    // Create response object
    const _response = { message: "", success: false, data: {} };

    //
    try {

        // Check for session uid and query
        const { uid } = request.cookies;
        if(!uid) {
            throw new Error("Invalid reference id");
        };

        // Read current chat history file
        // And check if its valid
        let _data = await Analytics.Read(uid);
        if(!_data) {
            throw new Error("Invalid chat history data");
        };

        // Send response
        _response.data = _data;
        _response.success = true;

    }
    catch(error) {

        // Log and set response for error
        console.log(chalk.red("/analytics/history:"), error);
        _response.message = error.message || "An error occurred";

    }
    finally {

        // send response
        response.send(_response);

    };

};