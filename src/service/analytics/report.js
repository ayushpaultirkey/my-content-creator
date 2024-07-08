import chalk from "chalk";

import Gemini from "#service/google/gemini.js";
import Youtube from "#service/google/youtube.js";
import Analytics from "#service/analytics.js";
import Sample from "#service/google/youtube/analytics/@sample.js";


export default async function Report({ request, rid, refresh, callback }) {

    try {

        //
        let _data = {};

        //
        if(await Analytics.Exist(rid)) {
            _data = await Analytics.Read(rid);
        };

        //
        if(!_data["channel"] || refresh) {
            
            //
            if(!_data["channel"]) {
                _data["channel"] = {};
                console.log(chalk.green("/S/Analytics/Report():"), "Channel entry addded");
            };

            //
            const _channel = await Youtube.Channel({
                request: request,
                callback: () => {}
            });

            //
            _data.channel = {
                detail: _channel,
                analytic: Sample.data
            };
            
            //
            let _history = (_data.history) ? _data.history : [];
            await Gemini.Prompt(Analytics.Config.E_GEMINI, JSON.stringify(_data.channel), _history);
            _data.history = _history;

            //
            await Analytics.Save(rid, _data);

        };

        //
        return _data;

    }
    catch(error) {
        console.log(chalk.red("/S/Analytics/Report():"), error);
        throw error;
    }

};