import "@style/main.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
import Attachment from "@component/attachment";
import Lazy from "@library/h12.lazy";
import Config from "@library/@config";


@Component
export default class Video extends H12 {

    constructor() {
        super();
        this.Report = null;
    }

    async init(args) {

        //
        this.Set("{c.name}", "");
        this.Set("{c.description}", "");

        //
        Dispatcher.On(Config.ON_ANALYTICS_REPORT, this.OnAnalyticReport.bind(this));

    }

    async render() {
        return <>
            <div class="w-full h-full overflow-hidden hidden">
                <div class="w-full h-full p-4 px-5 flex flex-col space-y-3 overflow-auto">

                    <div class="border border-transparent border-b-zinc-700 pb-3">
                        <label class="font-semibold text-zinc-400"><i class="mr-2 fa-solid fa-video"></i>Video</label>
                    </div>

                    <div class="flex flex-col text-xs font-semibold text-zinc-400">
                        <label>Title:</label>
                        <label class="text-zinc-300 text-base">{c.name}</label>
                    </div>

                    <div class="border border-transparent border-t-zinc-700 pt-3">
                        <label class="text-xs font-semibold text-zinc-400 block mb-1">Refresh Data:</label>
                        <button class="p-2 px-6 text-xs text-blue-100 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors">
                            <i class="fa-solid fa-splotch mr-2 pointer-events-none"></i>
                            Reload
                        </button>
                    </div>

                </div>
            </div>
        </>;
    }

    async Load() {
        try {

            


        }
        catch(error) {
            alert("Unable to get channel data");
            console.log(error);
        }
    }

    async OnAnalyticReport(event, report) {
        if(report) {
            this.Report = report;
            this.Load();
        };
    }

};