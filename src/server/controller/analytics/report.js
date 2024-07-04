import Container from "#library/container.js";
import Google from "#service/google.js";
import Config from "../../../service/google/youtube/analytics/@config.js";
import Sample from "../../../service/google/youtube/analytics/@sample.js";


/**
    *
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Report(request, response) {

    // Create response object
    const _response = { message: "", success: false, data: {} };

    //
    try {

        // // Check if there is user
        // if(!Google.Auth.HasToken(request)) {
        //     throw new Error("Google account not authenticated");
        // };

        // Check if video id exists
        // Else get the channel's analytics
        // const { vid } = request.query;

        // Get channel analytics result
        // const _analytics = await Google.Youtube.Analytics.Report();
        // _response.data = _analytics.data;

        //
        _response.data = Sample.data;
        _response.success = true;

    }
    catch(error) {

        // Log and set response for error
        console.log("/analytics/get:", error);
        _response.message = error.message || "An error occurred";

    }
    finally {

        // send response
        response.send(_response);

    };

};