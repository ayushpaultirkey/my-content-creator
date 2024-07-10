import "@style/main.css";
import H12 from "@library/h12";
import Config from "@library/config";
import Dispatcher from "@library/h12.dispatcher";
import Comment from "./comment";

@Component
export default class Detail extends H12 {
    constructor() {
        super();
        this.Report = null;
        this.VideoId = null;
    }
    async init() {

        // Register the dispatcher event
        // The dispatcher event can be called across the app
        Dispatcher.On(Config.ON_VIDEO_SELECT, this.OnVideoSelect.bind(this));
        Dispatcher.On(Config.ON_ANALYTICS_REPORT, this.OnAnalyticReport.bind(this));

    }
    async render() {
        return <>
            <div class="w-full h-full flex flex-col space-y-2 hidden">
                <div class="bg-green-600 h-72 bg-cover bg-center bg-no-repeat" id="VThumbnail" style="background-image: url(https://i.ytimg.com/vi/WDmFKfFDZPA/hqdefault.jpg);"></div>
                <div class="flex flex-col p-4 px-8 space-y-2 text-zinc-400">
                    <div class="flex flex-row space-x-2 md:space-x-4 items-center">
                        <label class="text-xl font-semibold w-full">{v.title}</label>
                        <button class="fa fa-home text-lg text-zinc-500 hover:text-blue-600" onclick={ () => { this.parent.TabViewport(0); } }></button>
                        <button class="fa fa-share text-lg text-zinc-500 hover:text-blue-600" onclick={ this.Redirect }></button>
                        <button class="text-xs flex items-center text-zinc-500 hover:text-blue-600" onclick={ this.Analyze }><i class="fa fa-splotch text-lg mr-2"></i><label class="-mt-1">Analyze</label></button>
                    </div>
                    <label class="text-xs font-semibold text-zinc-600" id="VDescription"></label>
                    <label class="border-b pb-2 border-zinc-700">Statistics:</label>
                    <div class="flex flex-col text-xs">
                        <label class="text-zinc-500">Views:</label>
                        <label class="text-zinc-600 text-base">{v.view}</label>
                    </div>
                    <div class="flex flex-col text-xs">
                        <label class="text-zinc-500">Likes:</label>
                        <label class="text-zinc-600 text-base">{v.like}</label>
                    </div>
                    <div class="flex flex-col text-xs">
                        <label class="text-zinc-500">Dislikes:</label>
                        <label class="text-zinc-600 text-base">{v.dislike}</label>
                    </div>
                    <div class="flex flex-col text-xs">
                        <label class="text-zinc-500">Comments:</label>
                        <label class="text-zinc-600 text-base">{v.comment}</label>
                    </div>
                    <label class="border-b pb-2 border-zinc-700">Comments:</label>
                    <div class="space-y-2">
                        {c.comment}
                    </div>
                </div>
            </div>
        </>;
    }
    Redirect() {

        const { VideoId, Report } = this;

        // Check if the video data is valid and then
        // redirect to the youtube video using its ID
        if(!VideoId || !Report || !Report.videos[VideoId]) {
            return false;
        };

        window.open(`https://www.youtube.com/watch?v=${VideoId}`, "_blank").focus();

    }
    async Analyze() {

        // Show loader while performing the task,
        // using using dispatcher event
        Dispatcher.Call(Config.ON_LOADER_SHOW);
        Dispatcher.Call(Config.ON_LOADER_UPDATE, "AI is analyzing video");

        try {

            // Check if the report is valid and the video
            // is valid using videos' id
            const { VideoId, Report } = this;
            if(!VideoId || !Report || !Report.videos[VideoId]) {
                throw new Error("Invalid video id or report");
            };

            // Call the api request and check for the success
            // and response status. The api will analyze video's
            // data and generate a report
            const _response = await fetch(`/api/analytics/analyze/video?videoId=${VideoId}`);
            const { success, data, message } = await _response.json();

            if(!success || !_response.ok) {
                throw new Error(message);
            };

            // Call dispatcher event to update the report data
            // with other components
            Dispatcher.Call(Config.ON_ANALYTICS_REPORT, data);

        }
        catch(error) {
            alert(error);
            console.error(error);
        };

        // Hide loader after performing the task,
        // using using dispatcher event
        Dispatcher.Call(Config.ON_LOADER_HIDE);

    }

    Comment = {
        Load: async () => {

            try {

                // Check if the report is valid and the video
                // is valid using videos' id
                const { Report, VideoId } = this;
                if(!Report || !VideoId) {
                    throw new Error("Invalid video or report")
                };
    
                // Call the api request and check for the success
                // and response status. The api will return the list
                // of comments for the youtube video
                const _response = await fetch(`/api/analytics/video/comment?videoId=${VideoId}&channelId=${Report.channel.detail.id}`);
                const { success, message, data } = await _response.json();

                if(!success || !_response.ok) {
                    throw new Error(message);
                };
    
                // Clear the old comments and remove the comment
                // component from this.child. Then add the new
                // comments
                this.Set("{c.comment}", "", Comment);

                for(var commet in data) {
                    this.Set("{c.comment}++", <><Comment args data={ data[commet] }></Comment></>);
                };

            }
            catch(error) {
                alert(error);
                console.error(error);
            };

        }
    }

    async OnVideoSelect(event, id) {
        
        try {

            const { element, Report } = this;
            const { VThumbnail, VDescription } = element;
    
            // Check if the report is valid and the video
            // is valid using videos' id
            if(!id || !Report || !Report.videos[id]) {
                throw new Error("Invalid video id or report");
            };

            // Set the new video id
            this.VideoId = id;
    
            // Get the all the video from report and get the video
            // by its id, to fetch its properties
            const { videos } = Report;
            const { title, description, thumbnail, stat } = videos[id];

            // Set the title and the desription for the video, along with
            // the thumbanil
            this.Set("{v.title}", title);
            VDescription.innerText = description;
            VThumbnail.style.backgroundImage = `url(${thumbnail})`;
    
            // If the video doesnt have the status property then
            // get the properties
            if(!stat) {
                
                // Show the loader
                Dispatcher.Call(Config.ON_LOADER_SHOW);
                Dispatcher.Call(Config.ON_LOADER_UPDATE, "Loading video statistics");

                // Call the api request and check for the success
                // and response status. The api will fetch the video's stat
                const _response = await fetch(`/api/analytics/video?videoId=${id}`);
                const { success, data, message } = await _response.json();
    
                if(!success || !_response.ok) {
                    throw new Error(message);
                };

                // Get the stat from the data by using video's
                // id
                const { stat: nStat } = data[id];
                if(!nStat) {
                    throw new Error("Unable to load stat");
                };

                // Set the new values using the stat
                const { count } = nStat;
                this.Set("{v.view}", count.view);
                this.Set("{v.like}", count.like);
                this.Set("{v.dislike}", count.dislike);
                this.Set("{v.comment}", count.comment);

            }
            else {
                
                // Set the values using the stat
                const { count } = stat;
                this.Set("{v.view}", count.view);
                this.Set("{v.like}", count.like);
                this.Set("{v.dislike}", count.dislike);
                this.Set("{v.comment}", count.comment);

            };

            // Load the comments for the current video
            await this.Comment.Load();

        }
        catch(error) {
            console.error(error);
        };

        // Hide the loader
        Dispatcher.Call(Config.ON_LOADER_HIDE);

    }
    async OnAnalyticReport(event, report) {

        // Called from dispatcher event to update the report data
        // The dispatcher event can be called across the app
        // Registered in init()
        if(report) {
            this.Report = report;
            this.OnVideoSelect(null, this.VideoId)
        };

    }
};