import chalk from "chalk";
import Analytics from "#service/analytics.js";
import Gemini from "#service/google/gemini.js";


export default async function Prompt({ rid, videoId, commentId, callback }) {

    try {

        //
        if(!await Analytics.Exist(rid)) {
            throw new Error("Analytic file not found");
        };

        //
        let _data = await Analytics.Read(rid);
        let _history = (_data.history) ? _data.history : [];

        //
        if(!_data.videos || !_data.videos[videoId] || !_data.videos[videoId].comment || !_data.videos[videoId].comment[commentId]) {
            throw new Error("Analytic file fields not found");
        };

        //
        const { title, description, comment } = _data.videos[videoId];
        const { snippet: { topLevelComment: { snippet: { textOriginal } } } } = comment[commentId];

        //
        const _prompt = `Create a reply for this youtube comment: ${textOriginal}
        \n\nVideo's Title: ${title},
        \nVideo's Description: ${description}`;

        //
        const _response = await Gemini.Prompt(Analytics.Config.E_GEMINI, _prompt, _history);
        _data.history = _history;

        //
        await Analytics.Save(rid, _data);

        //
        return { comment: _response.answer, data: _data };

    }
    catch(error) {
        console.log(chalk.red("/S/Analytics/Video/Comment/Prompt():"), error);
        throw new Error("Unable to generate comment");
    }

};