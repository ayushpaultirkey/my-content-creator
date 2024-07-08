import chalk from "chalk";
import Analytics from "#service/analytics.js";
import Youtube from "#service/google/youtube.js";

export default async function Send({ rid, videoId, commentId, comment, request, callback }) {

    try {

        //
        if(!await Analytics.Exist(rid)) {
            throw new Error("Analytic file not found");
        };

        //
        let _data = await Analytics.Read(rid);

        //
        if(!_data.videos || !_data.videos[videoId] || !_data.videos[videoId].comment || !_data.videos[videoId].comment[commentId]) {
            throw new Error("Analytic file fields not found");
        };

        //
        await Youtube.Comment.Send({
            request: request,
            comment: comment,
            commentId: commentId,
            callback: callback
        });

        //
        delete _data.videos[videoId].comment[commentId];

        //
        await Analytics.Save(rid, _data);

        //
        return _data;

    }
    catch(error) {
        console.log(chalk.red("/S/Analytics/Video/Comment/Send():"), error);
        throw error;
    }

};