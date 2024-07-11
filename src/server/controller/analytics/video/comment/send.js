import chalk from "chalk";
import Auth from "#service/google/auth.js";
import Analytics from "#service/analytics.js";


/**
    *
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Send(request, response) {

    // Create response body
    const _response = { message: "", success: false, data: null };

    try {

        // Check for cookies and query strings
        const { uid } = request.cookies;
        const { videoId, commentId, comment } = request.query;
        if(!uid || !videoId || !commentId || !comment) {
            throw new Error("Invalid video, comment or reference id");
        };

        // Check if the user is logged-in
        // with their google account
        if(!Auth.HasToken(request)) {
            throw new Error("Google account not authenticated");
        };

        // Add comment to youtbe video
        const _data = await Analytics.Video.Comment.Send({
            videoId: videoId,
            commentId: commentId,
            comment: comment,
            request: request,
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
        console.log(chalk.red("/analytics/video/comment/send:"), error);
        _response.message = error.message || "An error occurred";

    }
    finally {

        // Send response
        response.send(_response);

    };

};