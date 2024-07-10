import "@style/main.css";
import H12 from "@library/h12";
import Config from "@library/config";
import Dispatcher from "@library/h12.dispatcher";

@Component
export default class Video extends H12 {
    constructor() {
        super();
        this.Report = null;
    }
    async init(args) {

        // Set the default values for key for
        // the template fields
        this.Set("{c.video}", "");

        // Register the dispatcher event
        // The dispatcher event can be called across the app
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

            // Clear the previous video's list
            // before loading
            this.Set("{c.video}", "");

            // Check if report is valid before loading
            if(!this.Report) {
                throw new Error("Unable to load videos");
            };

            // Get the video from the report and check
            // if its valid and then render those videos
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

                // If there are no videos then fetch the
                // videos for the report
                await this.Fetch();

            };

        }
        catch(error) {
            console.log(error);
        };

    }
    async Selected(params) {
        
        // When a video is selected change the analytics
        // tab and call the dispatcher event to load
        // that video's data
        this.parent.TabViewport(1);
        Dispatcher.Call(Config.ON_VIDEO_SELECT, params);

    }
    async Reload() {

        // Show loader while performing the task
        Dispatcher.Call(Config.ON_LOADER_SHOW);
        Dispatcher.Call(Config.ON_LOADER_UPDATE, "Reloading videos");

        // Reload the videos by using the
        // refresh query parameter
        await this.Fetch("?refresh=true");

        // Hide loader after performing the task
        Dispatcher.Call(Config.ON_LOADER_HIDE);

    }
    async Fetch(param = "") {

        try {

            // Clear the previous video's list
            // before loading
            this.Set("{c.video}", "");
            
            // Call the api request and check for the success
            // and response status. The api will load all the video
            // from the channel
            const _response = await fetch(`/api/analytics/videos${param}`);
            const { success, message, data } = await _response.json();
    
            if(!success || !_response.ok) {
                throw new Error(message);
            };
    
            // Get the video from the data and 
            // render those videos
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

            // Call dispatcher event to update the report data
            // with other components
            Dispatcher.Call(Config.ON_ANALYTICS_REPORT, data.data)

        }
        catch(error) {
            alert(error);
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