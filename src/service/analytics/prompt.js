import chalk from "chalk";

import Gemini from "#service/google/gemini.js";
import Youtube from "#service/google/youtube.js";
import Analytics from "#service/analytics.js";
import Sample from "#service/google/youtube/analytics/@sample.js";


export default async function Prompt({ request, rid, prompt, file, callback }) {

    try {

        //
        if(!await Analytics.Exist(rid)) {
            throw new Error("Analytics file not found");
        };

        //
        let _data = await Analytics.Read(rid);
        let _history = (_data.history) ? _data.history : [];

        //
        if(file) {
            console.log(chalk.green("/S/Analytics/Prompt():"), "File found, adding multimodel prompt");
            await Gemini.PromptFile(Analytics.Config.E_GEMINI, file, _history);
        };

        //
        await Gemini.Prompt(Analytics.Config.E_GEMINI, prompt, _history);
        _data.history = _history;

        //
        Analytics.Save(rid, _data);

        //
        return _data;

    }
    catch(error) {
        console.log(chalk.red("/S/Analytics/Report():"), error);
        throw error;
    }

};