import "dotenv/config";
import chalk from "chalk";
import { google } from "googleapis";

import Auth from "./../auth.js";

export default async function Channel({ request, callback }) {

    try {

        let _data = {};

        // Log and callback
        console.log(chalk.green("/S/Google/Youtube/Channel():"), "Channel read started");
        callback("Youtube: Channel read started");

        // Get auth and load channel data
        const _auth = Auth.OAuth2Client(request);
        const _youtube = google.youtube({ version: "v3", auth: _auth });
        const _response = await _youtube.channels.list({
            part: ["snippet", "statistics"],
            mine: true,
        });
        
        // Get channel data and check it
        const _channel = _response.data.items[0];
        if(!_channel) {
            throw new Error("Channel not found");
        };

        // Copy the data and prepare to return
        const { title, description, customUrl } = _channel.snippet;
        const { commentCount, subscriberCount, videoCount, viewCount } = _channel.statistics;

        // Set channel data
        _data = {
            id: _channel.id,
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
        console.log(chalk.green("/S/Google/Youtube/Channel():"), "Channel read ended");
        callback("Youtube: Channel read ended");

        return _data;

    }
    catch(error) {

        console.log(chalk.red("/S/Google/Youtube/Channel():"), error);
        throw new Error("Unable to read channel data");
        
    };

};