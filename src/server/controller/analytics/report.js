import chalk from "chalk";

import Auth from "#service/google/auth.js";
import Gemini from "#service/google/gemini.js";
import Youtube from "#service/google/youtube.js";
import Analytics from "#service/analytics.js";

import Sample from "#service/google/youtube/analytics/@sample.js";

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

        // Check for session uid and query
        const { uid } = request.cookies;
        const { refresh } = request.query;
        if(!uid) {
            throw new Error("Invalid session");
        };

        // Check if there is user
        if(!Auth.HasToken(request)) {
            throw new Error("Google account not authenticated");
        };

        // Check if video id exists
        // Else get the channel's analytics
        // const { vid } = request.query;

        // Get channel analytics result
        // const _analytics = await Google.Youtube.Analytics.Report();
        // _response.data = _analytics.data;

        // Get files from drive
        if(!refresh && await Analytics.Exist(uid)) {

            _response.data = await Analytics.Read(uid);

        }
        else {

            const _channel = await Youtube.Channel({ callback: () => {} });
            const _channelData = {
                channel: _channel,
                analytic: Sample.data
            };

            let _history = [];
            await Gemini.Prompt(Analytics.Config.E_GEMINI, JSON.stringify(_channelData), _history);
            
            const _finalData = {
                ... _channelData,
                history: _history
            };
            
            await Analytics.Save(uid, _finalData);
            _response.data = _finalData;

        };

        //
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