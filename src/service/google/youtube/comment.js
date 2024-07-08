import "dotenv/config";
import chalk from "chalk";
import { google } from "googleapis";

import Auth from "./../auth.js";

export default async function Comment({ videoId, channelId, request, callback }) {

    try {

        // Log and callback
        console.log(chalk.green("/S/Google/Youtube.Comment():"), "Comment read started");
        callback("Youtube: Comment read started");

        // Get auth and load channel data
        const _auth = Auth.OAuth2Client(request);
        const _youtube = google.youtube({ version: "v3", auth: _auth });

        //
        const _response = await _youtube.commentThreads.list({
            part: "snippet",
            videoId: videoId,
            maxResults: 100,
        });
        
        //
        const _comment = {};
        const { items: pItems } = _response.data;
        if(pItems) {

            for(const c of pItems) {

                if(c.snippet.totalReplyCount == 0 && c.snippet.topLevelComment.snippet.authorChannelId.value !== channelId) {
                    _comment[c.id] = c;
                    continue;
                };

                const _cResponse = await _youtube.comments.list({
                    part: "snippet",
                    parentId: c.id
                });
                const { items: cItems } = _cResponse.data;
                if(cItems) {

                    for(const p of cItems) {
                        if(p.snippet.channelId === channelId) {
                            break;
                        };
                        _comment[c.id] = c;
                    }

                };

            };

        };


        // Log and callback
        console.log(chalk.green("/S/Google/Youtube.Comment():"), "Comment read ended");
        callback("Comment: Comment read ended");

        //
        return _comment;

    }
    catch(error) {

        console.log(chalk.red("/S/Google/Youtube.Comment():"), error);
        throw new Error("Unable to read comments");

    };

};