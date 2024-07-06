import "dotenv/config";
import chalk from "chalk";
import { google } from "googleapis";

import Auth from "./../auth.js";

export default async function Videos({ pageToken, channelId, callback }) {

    try {

        // For return
        let _data = {};

        // Log and callback
        console.log(chalk.green("/S/Google/Youtube.Videos():"), "Channel read started");
        callback("Youtube: Video listing started");

        // Get auth and load channel data
        const _auth = Auth.OAuth2Client();
        const _youtube = google.youtube({ version: "v3", auth: _auth });

        //
        const _response = await _youtube.search.list({
            part: "snippet",
            forMine: true,
            maxResults: 10,
            pageToken: (!pageToken) ? null : pageToken,
        });

        // Get channel data and check it
        const _videos = _response.data;
        if(!_videos) {
            throw new Error("Videos not found");
        };

        // Copy the data and prepare to return
        const { title, description, customUrl } = _channel.snippet;
        const { commentCount, subscriberCount, videoCount, viewCount } = _channel.statistics;
        _data = {
            name: title,
            description: description,
            url: customUrl,
            count: {
                comment: commentCount,
                subscriber: subscriberCount,
                video: videoCount,
                view: viewCount
            }
        };
        
        // Log and callback
        console.log(chalk.green("/S/Google/Youtube.Videos():"), "Video listing ended");
        callback("Youtube: Video listing ended");

        //
        return _data;

    }
    catch(error) {

        console.log(chalk.red("/S/Google/Youtube.Videos():"), error);
        throw new Error("Unable to read videos");

    };

};