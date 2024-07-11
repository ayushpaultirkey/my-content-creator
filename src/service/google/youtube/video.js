import "dotenv/config";
import chalk from "chalk";
import { google } from "googleapis";

import Auth from "./../auth.js";

export default async function Video({ videoId, request, callback }) {

    try {

        // Log and callback
        console.log(chalk.green("/S/Google/Youtube/Video():"), "Video read started");
        callback("Youtube: Video detail read started");

        // Get auth and load channel data
        const _auth = Auth.OAuth2Client(request);
        const _youtube = google.youtube({ version: "v3", auth: _auth });

        // Get the video detail
        const _response = await _youtube.videos.list({
            id: videoId,
            part: "snippet,statistics",
        });
        
        // Get channel data and check it
        const { items } = _response.data;
        if(!items) {
            throw new Error("Videos not found");
        };

        // Set the video data
        const _video = {};
        const { kind, snippet, statistics } = items[0];
        if(kind.includes("video")) {

            _video[videoId] = {
                title: snippet.title,
                description: snippet.description,
                thumbnail: snippet.thumbnails.high.url,
                published: snippet.publishedAt,
                stat: {
                    count: {
                        like: statistics.likeCount,
                        view: statistics.viewCount,
                        dislike: statistics.dislikeCount,
                        comment: statistics.commentCount
                    }
                }
            };

        };
        
        // Log and callback
        console.log(chalk.green("/S/Google/Youtube/Video():"), "Video read ended");
        callback("Youtube: Video detail read ended");

        return _video;

    }
    catch(error) {
        
        console.log(chalk.red("/S/Google/Youtube/Video():"), error);
        throw new Error("Unable to read video data");

    };

};