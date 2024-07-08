import chalk from "chalk";

import Auth from "#service/google/auth.js";
import Analytics from "#service/analytics.js";


/**
    *
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Prompt(request, response) {

    // Create response object
    const _response = { message: "", success: false, data: null };

    //
    try {

        // Check for session uid and query
        const { uid } = request.cookies;
        const { videoId, commentId, comment } = request.query;
        if(!uid || !videoId || !commentId || !comment) {
            throw new Error("Invalid video, comment or reference id");
        };

        // Check if there is user
        if(!Auth.HasToken(request)) {
            throw new Error("Google account not authenticated");
        };

        //
        const _data = await Analytics.Video.Comment.Send({
            videoId: videoId,
            commentId: commentId,
            comment: comment,
            request: request,
            rid: uid,
            callback: () => {

            }
        });

        //
        _response.data = _data;
        _response.success = true;

    }
    catch(error) {

        // Log and set response for error
        console.log(chalk.red("/analytics/video/comment/prompt:"), error);
        _response.message = error.message || "An error occurred";

    }
    finally {

        // send response
        response.send(_response);

    };

};