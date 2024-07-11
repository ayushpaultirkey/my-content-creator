import chalk from "chalk";
import Youtube from "#service/google/youtube.js";
import Analytics from "#service/analytics.js";
import Gemini from "#service/google/gemini.js";


export default async function Video({ refresh, rid, videoId, request, callback }) {

    try {

        let _data = {};
        let _video = {};

        // Check if the analytics file exists
        if(await Analytics.Exist(rid)) {
            _data = await Analytics.Read(rid);
        };

        // Check if the video entry exists
        if(!_data.videos || !_data.videos[videoId] || !_data.videos[videoId].stat || refresh) {

            if(!_data.videos) {
                _data.videos = {};
                console.log(chalk.green("/S/Analytics/Analyze/Video():"), "Video entry added");
                callback("Analytics: Video entry added");
            };
            if(!_data.videos[videoId]) {
                _data.videos[videoId] = {};
                console.log(chalk.green("/S/Analytics/Analyze/Video():"), "Video entry added by id");
                callback("Analytics: Video entry added by id");
            };

            // Get video detail
            _video = await Youtube.Video({
                videoId: videoId,
                request: request,
                callback: callback
            });

            // Append video entry
            _data.videos = {
                ... _data.videos,
                ... _video
            };

        }
        else {
            _video = _data.videos[videoId];
        };

        // Callback
        callback("Analytics: AI is analyzing video detail");

        // Create prompt
        let _prompt = `Analyze this video data: ${JSON.stringify(_video)}`;

        // Get history of the chat and generate answer
        let _history = (_data.history) ? _data.history : [];
        await Gemini.Prompt(Analytics.Config.E_GEMINI, _prompt, _history);
        _data.history = _history;

        // Save report and return it
        await Analytics.Save(rid, _data);

        // Callback
        callback("Analytics: Finishing");

        return _data;

    }
    catch(error) {
        console.log(chalk.red("/S/Analytics/Analyze/Video():"), error);
        throw new Error("Unable to analyze video");
    };

};