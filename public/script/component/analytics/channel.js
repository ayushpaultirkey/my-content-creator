import "@style/main.css";
import H12 from "@library/h12";
import Config from "@library/config";
import Dispatcher from "@library/h12.dispatcher";

@Component
export default class Channel extends H12 {
    constructor() {
        super();
        this.Report = null;
    }
    async init(args) {

        // Set the default values for key for
        // the template fields
        this.Set("{c.name}", "");
        this.Set("{c.description}", "");

        // Register the dispatcher event
        // The dispatcher event can be called across the app
        Dispatcher.On(Config.ON_ANALYTICS_REPORT, this.OnAnalyticReport.bind(this));

    }
    async render() {
        return <>
            <div class="w-full h-full overflow-hidden hidden">
                <div class="w-full h-full p-4 px-5 flex flex-col space-y-3 overflow-auto">

                    <div class="border border-transparent border-b-zinc-700 pb-3">
                        <label class="font-semibold text-zinc-400"><i class="mr-2 fa-solid fa-layer-group"></i>Channel</label>
                    </div>

                    <div class="flex flex-col text-xs font-semibold text-zinc-400">
                        <label>Title:</label>
                        <label class="text-zinc-300 text-base">{c.name}</label>
                    </div>

                    <div class="flex flex-col text-xs font-semibold text-zinc-400">
                        <label>Description:</label>
                        <label class="text-zinc-300 text-base">{c.description}</label>
                    </div>

                    <div class="flex flex-col text-xs font-semibold text-zinc-400">
                        <label>URL:</label>
                        <a class="text-blue-500 text-base" href="https://www.youtube.com/{c.url}" target="_blank" rel="noopener noreferrer">{c.url}</a>
                    </div>

                    <div class="flex flex-col text-xs font-semibold text-zinc-400">
                        <label>Subscribers:</label>
                        <label class="text-zinc-300 text-base">{c.subs}</label>
                    </div>

                    <div class="flex flex-col text-xs font-semibold text-zinc-400">
                        <label>Views:</label>
                        <label class="text-zinc-300 text-base">{c.view}</label>
                    </div>

                    <div class="flex flex-col text-xs font-semibold text-zinc-400">
                        <label>Videos:</label>
                        <label class="text-zinc-300 text-base">{c.video}</label>
                    </div>

                    <div class="border border-transparent border-t-zinc-700 pt-3">
                        <label class="text-xs font-semibold text-zinc-400 block mb-1">Analyze Data:</label>
                        <button
                            class="p-2 px-6 text-xs text-blue-100 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors"
                            onclick={ () => { this.parent.Load("?refresh=true"); }}>
                            <i class="fa-solid fa-splotch mr-2 pointer-events-none"></i>
                            Analyze
                        </button>
                    </div>

                </div>
            </div>
        </>;
    }
    async Load() {

        try {

            // Check if report is valid before loading
            if(!this.Report) {
                throw new Error("Invalid report");
            };

            // Break report object and get the channel's information
            // Set the information using the key {c.name} etc.
            const { channel: { detail } } = this.Report;
            this.Set("{c.name}", detail.name);
            this.Set("{c.description}", (detail.description) ? detail.description : "No Description");
            this.Set("{c.url}", detail.url);
            this.Set("{c.subs}", detail.count.subscriber);
            this.Set("{c.view}", detail.count.view);
            this.Set("{c.video}", detail.count.video);

        }
        catch(error) {
            alert("Unable to get channel data");
            console.log(error);
        };

    }
    async OnAnalyticReport(event, report) {

        // Called from dispatcher event to update the report data
        // The dispatcher event can be called across the app
        // Registered in init()
        if(report) {
            this.Report = report;
            this.Load();
        };

    }
};