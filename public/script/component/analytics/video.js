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
        this.Set("{c.video}", "");
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
                        {c.video}
                    </div>
                    
                    <div class="border border-transparent border-t-zinc-700 pt-3">
                        <button class="p-2 px-6 text-xs text-blue-100 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors" onclick={ this.Reload }>
                            <i class="fa-solid fa-refresh mr-2 pointer-events-none"></i>
                            Reload
                        </button>
                    </div>

                </div>
            </div>
        </>;
    }


    async Load() {
        try {

            this.Set("{c.video}", "");

            if(!this.Report) {
                throw new Error("Unable to load videos");
            };

            const { videos } = this.Report;
            if(videos) {

                for(const id in videos) {
                    const { title, thumbnail } = videos[id];
                    this.Set("{c.video}++", <>
                        <div class="flex flex-row bg-zinc-700 bg-opacity-50 hover:bg-opacity-80 active:bg-opacity-90 w-full h-20 overflow-hidden mb-2 rounded-md" onclick={ () => { this.Selected(id) } }>
                            <div class="min-w-20 max-w-20">
                                <div class="bg-cover bg-center bg-no-repeat w-full h-full" style={ `background-image: url(${ thumbnail });` }></div>
                            </div>
                            <div class="p-2">
                                <label>{ title }</label>
                            </div>
                        </div>
                    </>);
                };

            }
            else {
                await this.Fetch();
            };

        }
        catch(error) {
            console.log(error);
        };

    }

    async Selected(params) {
        
        this.parent.TabViewport(1);
        Dispatcher.Call(Config.ON_VIDEO_SELECT, params);

    }

    async Reload() {

        Dispatcher.Call(Config.ON_LOADER_SHOW);
        Dispatcher.Call(Config.ON_LOADER_UPDATE, "Reloading videos");

        await this.Fetch("?refresh=true");

        Dispatcher.Call(Config.ON_LOADER_HIDE);

    }

    async Fetch(param = "") {
        try {

            this.Set("{c.video}", "");
            
            const _response = await fetch(`/api/analytics/videos${param}`);
            const { success, message, data } = await _response.json();
    
            if(!success || !_response.ok) {
                throw new Error(message);
            };
    
            const { data: { videos } } = data;
            
            for(const id in videos) {
                const { title, thumbnail } = videos[id];
                this.Set("{c.video}++", <>
                    <div class="flex flex-row bg-zinc-700 bg-opacity-50 hover:bg-opacity-80 active:bg-opacity-90 w-full h-20 overflow-hidden mb-2 rounded-md" onclick={ () => { this.Selected(id) } }>
                        <div class="min-w-20 max-w-20">
                            <div class="bg-cover bg-center bg-no-repeat w-full h-full" style={ `background-image: url(${ thumbnail });` }></div>
                        </div>
                        <div class="p-2">
                            <label>{ title }</label>
                        </div>
                    </div>
                </>);
            };

        }
        catch(error) {
            alert(error);
            console.log(error);
        };
    }

    async OnAnalyticReport(event, report) {
        if(report) {
            this.Report = report;
            this.Load();
        };
    }

};