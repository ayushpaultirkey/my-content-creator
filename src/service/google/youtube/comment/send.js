import "dotenv/config";
import chalk from "chalk";
import { google } from "googleapis";

import Auth from "./../../auth.js";

export default async function Send({ comment, commentId, request, callback }) {

    try {

        // Log and callback
        console.log(chalk.green("/S/Google/Youtube/Comment/Send():"), "Comment send started");
        callback("Youtube: Comment send started");

        // Get the oauth and send comment
        const _oauth2 = Auth.OAuth2Client(request);
        const _youtube = google.youtube({ version: "v3", auth: _oauth2 });

        await _youtube.comments.insert({
            part: "snippet",
            resource: {
                snippet: {
                    parentId: commentId,
                    textOriginal: comment,
                },
            },
        });
        
        // Log and callback
        console.log(chalk.green("/S/Google/Youtube/Comment/Send():"), "Comment send ended");
        callback("Comment: Comment send ended");

        return true;

    }
    catch(error) {
        
        console.log(chalk.red("/S/Google/Youtube/Comment/Send():"), error);
        throw new Error("Unable to send comment");

    };

};