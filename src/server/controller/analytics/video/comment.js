import chalk from "chalk";
import Auth from "#service/google/auth.js";
import Analytics from "#service/analytics.js";


/**
    *
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Comment(request, response) {

    // Create response body
    const _response = { message: "", success: false, data: null };

    try {

        // Check for cookies and query strings
        const { uid } = request.cookies;
        const { videoId, channelId } = request.query;
        if(!uid || !videoId || !channelId) {
            throw new Error("Invalid video, channel or reference id");
        };

        // Check if the user is logged-in
        // with their google account
        if(!Auth.HasToken(request)) {
            throw new Error("Google account not authenticated");
        };

        // Get all list of video's comment
        const _data = await Analytics.Video.Comment({
            request: request,
            rid: uid,
            videoId: videoId,
            channelId: channelId,
            callback: () => {

            }
        });

        // Set new response data
        _response.data = _data;
        _response.success = true;

    }
    catch(error) {

        // Log and set response for error
        console.log(chalk.red("/analytics/video/comment:"), error);
        _response.message = error.message || "An error occurred";

    }
    finally {

        // Send response
        response.send(_response);

    };

};