import "dotenv/config";
import chalk from "chalk";
import { google } from "googleapis";

import Auth from "./../auth.js";

export default async function Trending({ region, request, callback }) {

    try {

        // Log and callback
        console.log(chalk.green("/S/Google/Youtube/Trending():"), "Trending read started");
        callback("Youtube: Trending read started");

        // Get auth and load channel data
        const _auth = Auth.OAuth2Client(request);
        const _youtube = google.youtube({ version: "v3", auth: _auth });

        // Get the video detail
        const _response = await _youtube.videos.list({
            part: "snippet,statistics",
            regionCode: (region) ? region : "IN",
            chart: "mostPopular"
        })
        
        // Get video data and check it
        const { items } = _response.data;
        if(!items) {
            throw new Error("Videos not found");
        };
        
        // Log and callback
        console.log(chalk.green("/S/Google/Youtube/Trending():"), "Trending read ended");
        callback("Youtube: Trending read ended");

        return items;

    }
    catch(error) {
        
        console.log(chalk.red("/S/Google/Youtube/Trending():"), error);
        throw new Error("Unable to get video data");

    };

};