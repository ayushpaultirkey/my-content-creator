import "dotenv/config";
import chalk from "chalk";
import { google } from "googleapis";

import Auth from "./../auth.js";

export default async function Videos({ pageToken, request, callback }) {

    try {

        // Log and callback
        console.log(chalk.green("/S/Google/Youtube/Videos():"), "Video listing started");
        callback("Youtube: Video listing started");

        // Get auth and load channel data
        const _auth = Auth.OAuth2Client(request);
        const _youtube = google.youtube({ version: "v3" });

        // Get all videos from channel
        const _response = await _youtube.search.list({
            auth: _auth,
            part: "snippet",
            type: "video",
            forMine: true,
            maxResults: 100,
            pageToken: (!pageToken) ? null : pageToken,
        });

        // Get channel data and check it
        const { items } = _response.data;
        if(!items) {
            throw new Error("Videos not found");
        };

        // Set the videos
        const _videos = {};
        for(var i = 0, ilen = items.length; i < ilen; i++) {

            const { id, snippet } = items[i];

            if(!id.kind.includes("video")) {
                continue;
            };

            _videos[id.videoId] = {
                title: snippet.title,
                description: snippet.description,
                thumbnail: snippet.thumbnails.high.url,
                published: snippet.publishedAt,
                published: snippet.publishedAt,
            };

        };
        
        // Log and callback
        console.log(chalk.green("/S/Google/Youtube/Videos():"), "Video listing ended");
        callback("Youtube: Video listing ended");

        return { videos: _videos, pageToken: _response.data.nextPageToken };

    }
    catch(error) {

        console.log(chalk.red("/S/Google/Youtube/Videos():"), error);
        throw new Error("Unable to read videos");

    };

};