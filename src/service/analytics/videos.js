import chalk from "chalk";
import Youtube from "#service/google/youtube.js";
import Analytics from "#service/analytics.js";


export default async function Videos({ request, pageToken, rid, refresh, callback }) {

    try {

        let _data = {};
        let _pageToken = null;

        // Check if the analytics file exists
        if(await Analytics.Exist(rid)) {
            _data = await Analytics.Read(rid);
        };

        // Check if video is valid
        if(!_data["videos"] || refresh) {

            if(!_data["videos"]) {
                _data["videos"] = {};
                console.log(chalk.green("/S/Analytics/Videos():"), "Video entry addded");
            };

            // Read all list of videos append it
            const _ytVideos = await Youtube.Videos({
                pageToken: pageToken,
                callback: callback,
                request: request
            });
            _pageToken = _ytVideos.pageToken;

            _data["videos"] = {
                ... _data["videos"],
                ... _ytVideos.videos
            };

            console.log(chalk.green("/S/Analytics/Videos():"), "New video data fetched");

            // Save the new report
            await Analytics.Save(rid, _data);

        };

        return {
            data: _data,
            pageToken: _pageToken
        };

    }
    catch(error) {
        console.log(chalk.red("/S/Analytics/Videos():"), error);
        throw new Error("Unable to get videos");
    };

};