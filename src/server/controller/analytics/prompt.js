import chalk from "chalk";
import Analytics from "#service/analytics.js";
import Gemini from "#service/google/gemini.js";

/**
    *
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Prompt(request, response) {

    // Create response object
    const _response = { message: "", success: false, data: {} };

    //
    try {

        // Check for session uid and query
        const { uid } = request.cookies;
        const { q } = request.query;
        if(!q || !uid) {
            throw new Error("Invalid prompt or session");
        };

        // Read current chat session file
        // And check if its valid
        let _data = await Analytics.Read(uid);
        if(!_data) {
            throw new Error("Invalid chat session data");
        };

        // Generate answer
        const { answer } = await Gemini.Prompt(Analytics.Config.E_GEMINI, q, _data.history);
        
        // Update chat session data
        await Analytics.Save(uid, _data);

        // Send response
        _response.data = answer;
        _response.success = true;

    }
    catch(error) {

        // Log and set response for error
        console.log(chalk.red("/analytics/prompt:"), error);
        _response.message = error.message || "An error occurred";

    }
    finally {

        // send response
        response.send(_response);

    };

};