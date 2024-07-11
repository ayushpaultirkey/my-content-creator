import chalk from "chalk";
import Youtube from "#service/google/youtube.js";
import Analytics from "#service/analytics.js";


export default async function Comment({ refresh, rid, videoId, channelId, request, callback }) {

    try {

        let _data = {};
        let _comment = {};

        // Check if the analytics file exists
        if(await Analytics.Exist(rid)) {
            _data = await Analytics.Read(rid);
        };

        // Check if the video, comment entry exists
        if((_data.videos && _data.videos[videoId] && !_data.videos[videoId].comment) || refresh) {

            if(!_data.videos[videoId].comment) {
                _data.videos[videoId].comment = {};
                console.log(chalk.green("/S/Analytics/Video/Comment():"), "Video comment entry added");
                callback("Analytics: Video comment entry added");
            };

            // Get commnet data
            _comment = await Youtube.Comment({
                channelId: channelId,
                videoId: videoId,
                request: request,
                callback: callback
            });

            // Append comment data
            _data.videos[videoId].comment = {
                ... _data.videos[videoId].comment,
                ... _comment
            };

            // Save report and callback
            await Analytics.Save(rid, _data);

        }
        else {

            // Read old comments
            _comment = _data.videos[videoId].comment;
            console.log(chalk.green("/S/Analytics/Video/Comment():"), "Comment entry found");
        
        };

        return _comment;

    }
    catch(error) {
        console.log(chalk.red("/S/Analytics/Video/Comment():"), error);
        throw new Error("Unable to get video's comments");
    };

};