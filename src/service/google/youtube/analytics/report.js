import "dotenv/config";
import chalk from "chalk";
import { google } from "googleapis";
import GAuth from "../../auth.js";

export default async function Report({ request, callback }) {

    try {

        // Calculate the starting date and the current date
        // 1 month from today
        const _cDate = new Date();
        const _cYear = _cDate.getFullYear();
        const _cMonth = String(_cDate.getMonth() + 1).padStart(2, '0');
        const _cDay = String(_cDate.getDate()).padStart(2, '0');
        const _cFormat = `${_cYear}-${_cMonth}-${_cDay}`;

        const _lDate = new Date();
        _lDate.setMonth(_lDate.getMonth() - 1);
        const _lYear = _lDate.getFullYear();
        const _lMonth = String(_lDate.getMonth() + 1).padStart(2, '0');
        const _lDay = String(_lDate.getDate()).padStart(2, '0');
        const _lFormat = `${_lYear}-${_lMonth}-${_lDay}`;

        // Get the oauth and the response
        const _analytics = google.youtubeAnalytics("v2");
        const _auth = GAuth.OAuth2Client(request);

        const _response = await _analytics.reports.query({
            auth: _auth,
            ids: "channel==MINE",
            startDate: _lFormat,
            endDate: _cFormat,
            metrics: "views,likes,dislikes,estimatedMinutesWatched",
            dimensions: "day",
            sort: "day"
        });

        return _response;

    }
    catch(error) {

        console.error(chalk.red("/S/Google/Youtube/Analytics/Report():"), error);
        throw new Error("Unable to get analytics report");
        
    };

};