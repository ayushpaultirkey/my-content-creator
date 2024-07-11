import chalk from "chalk";
import Analytics from "#service/analytics.js";
import Youtube from "#service/google/youtube.js";


export default async function Send({ rid, videoId, commentId, comment, request, callback }) {

    try {

        // Check if the analytics file exists
        // and read data
        if(!await Analytics.Exist(rid)) {
            throw new Error("Analytic file not found");
        };

        let _data = await Analytics.Read(rid);

        // Check if video, comment entry exists
        if(!_data.videos || !_data.videos[videoId] || !_data.videos[videoId].comment || !_data.videos[videoId].comment[commentId]) {
            throw new Error("Analytic file fields not found");
        };

        // Send comment and delete it from the
        // analytics file
        await Youtube.Comment.Send({
            request: request,
            comment: comment,
            commentId: commentId,
            callback: callback
        });

        delete _data.videos[videoId].comment[commentId];

        // Save report and return it
        await Analytics.Save(rid, _data);

        return _data;

    }
    catch(error) {
        console.log(chalk.red("/S/Analytics/Video/Comment/Send():"), error);
        throw new Error("Unable to send comment");
    };

};