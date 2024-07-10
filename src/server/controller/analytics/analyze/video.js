import chalk from "chalk";
import Auth from "#service/google/auth.js";
import Analytics from "#service/analytics.js";


/**
    *
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Video(request, response) {

    // Create response object
    const _response = { message: "", success: false, data: {} };

    //
    try {

        // Check for session uid and query
        const { uid } = request.cookies;
        const { videoId, refresh } = request.query;
        if(!uid || !videoId) {
            throw new Error("Invalid video id or reference id");
        };

        // Check if there is user
        if(!Auth.HasToken(request)) {
            throw new Error("Google account not authenticated");
        };

        let _data = await Analytics.Analyze.Video({
            refresh: refresh,
            rid: uid,
            videoId: videoId,
            request: request,
            callback: () => {

            }
        })

        _response.data = _data;
        _response.success = true;

    }
    catch(error) {

        // Log and set response for error
        console.log(chalk.red("/analytics/analyze/videos:"), error);
        _response.message = error.message || "An error occurred";

    }
    finally {

        // send response
        response.send(_response);

    };

};