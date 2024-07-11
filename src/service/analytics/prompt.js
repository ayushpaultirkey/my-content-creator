import chalk from "chalk";
import Gemini from "#service/google/gemini.js";
import Analytics from "#service/analytics.js";


export default async function Prompt({ rid, prompt, file, callback }) {

    try {

        // Check if the analytics file exists and 
        // read data and history
        if(!await Analytics.Exist(rid)) {
            throw new Error("Analytics file not found");
        };

        let _data = await Analytics.Read(rid);
        let _history = (_data.history) ? _data.history : [];

        // Check if file is valid then use
        // the multi model
        if(file) {
            console.log(chalk.green("/S/Analytics/Prompt():"), "File found, using multimodel prompt");
            await Gemini.PromptFile(Analytics.Config.E_GEMINI, file, _history);
        };

        // Send prompt
        await Gemini.Prompt(Analytics.Config.E_GEMINI, prompt, _history);
        _data.history = _history;

        // Save report and return it
        Analytics.Save(rid, _data);

        return _data;

    }
    catch(error) {
        console.log(chalk.red("/S/Analytics/Prompt():"), error);
        throw new Error("Unable to generate answer");
    };

};