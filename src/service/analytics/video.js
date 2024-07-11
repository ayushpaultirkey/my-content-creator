import chalk from "chalk";
import Youtube from "#service/google/youtube.js";
import Analytics from "#service/analytics.js";


export default async function Video({ refresh, rid, videoId, request, callback }) {

    try {

        let _data = {};
        let _video = {};

        // Check if the analytics file exists
        if(await Analytics.Exist(rid)) {
            _data = await Analytics.Read(rid);
        };

        // Check if video is valid
        if(!_data.videos || !_data.videos[videoId] || !_data.videos[videoId].stat || refresh) {

            if(!_data.videos) {
                _data.videos = {};
                console.log(chalk.green("/S/Analytics/Video():"), "Video entry added");
                callback("Analytics: Video entry added");
            };
            if(!_data.videos[videoId]) {
                _data.videos[videoId] = {};
                console.log(chalk.green("/S/Analytics/Video():"), "Video entry added by id");
                callback("Analytics: Video entry added by id");
            };

            // Read video data and append it
            _video = await Youtube.Video({
                videoId: videoId,
                request: request,
                callback: callback
            });

            _data.videos = {
                ... _data.videos,
                ... _video
            };

            // Save the new data
            await Analytics.Save(rid, _data);

        }
        else {
            _video = _data.videos[videoId];
            console.log(chalk.green("/S/Analytics/Video():"), "Video entry found by id");
        };

        return _video;

    }
    catch(error) {
        console.log(chalk.red("/S/Analytics/Video():"), error);
        throw new Error("Unable to get video detail");
    };

};