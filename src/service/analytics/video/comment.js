import chalk from "chalk";
import Youtube from "#service/google/youtube.js";
import Analytics from "#service/analytics.js";


export default async function Comment({ refresh, rid, videoId, channelId, request, callback }) {

    try {

        //
        let _data = {};
        let _comment = {};

        //
        if(await Analytics.Exist(rid)) {
            _data = await Analytics.Read(rid);
        };

        //
        if((_data.videos && _data.videos[videoId] && !_data.videos[videoId].comment) || refresh) {

            //
            if(!_data.videos[videoId].comment) {
                _data.videos[videoId].comment = {};
                console.log(chalk.green("/S/Analytics/Video/Comment():"), "Video comment entry added");
            };

            //
            _comment = await Youtube.Comment({
                channelId: channelId,
                videoId: videoId,
                request: request,
                callback: callback
            });

            //
            _data.videos[videoId].comment = {
                ... _data.videos[videoId].comment,
                ... _comment
            };

            //
            await Analytics.Save(rid, _data);

        }
        else {
            _comment = _data.videos[videoId].comment;
            console.log(chalk.green("/S/Analytics/Video/Comment():"), "Comment entry found");
        };

        //
        return _comment;

    }
    catch(error) {
        console.log(chalk.red("/S/Analytics/Video/Comment():"), error);
        throw new Error("Unable to get video's comments");
    }

};