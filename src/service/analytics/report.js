import chalk from "chalk";
import Gemini from "#service/google/gemini.js";
import Youtube from "#service/google/youtube.js";
import Analytics from "#service/analytics.js";

export default async function Report({ request, rid, refresh, callback }) {

    try {

        let _data = {};

        // Check if the analytics file exists and 
        // read data and history
        if(await Analytics.Exist(rid)) {
            _data = await Analytics.Read(rid);
        };

        // Check if the channel data is valid
        if(!_data["channel"] || refresh) {
            
            if(!_data["channel"]) {
                _data["channel"] = {};
                console.log(chalk.green("/S/Analytics/Report():"), "Channel entry addded");
            };

            // Get the channel analytics report
            const _analytics = await Youtube.Analytics.Report({
                request: request,
                callback: () => {}
            });

            // Get the channel data
            const _channel = await Youtube.Channel({
                request: request,
                callback: () => {}
            });

            // Set the channel data
            _data.channel = {
                detail: _channel,
                analytic: _analytics.data
            };

            // Generate the answer and retunr the data
            let _history = (_data.history) ? _data.history : [];
            await Gemini.Prompt(Analytics.Config.E_GEMINI, JSON.stringify(_data.channel), _history);
            _data.history = _history;
            
            // Save the analytics report
            await Analytics.Save(rid, _data);

        };

        return _data;

    }
    catch(error) {
        console.log(chalk.red("/S/Analytics/Report():"), error);
        throw new Error("Unable to generate video report");
    };

};