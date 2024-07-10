import "@style/main.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
import Config from "@library/@config";
import Comment from "./comment";

@Component
export default class Detail extends H12 {
    
    constructor() {
        super();
        this.Report = null;
        this.VideoId = null;
    }

    async init() {

        //
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

        if(!VideoId || !Report || !Report.videos[VideoId]) {
            return false;
        };

        window.open(`https://www.youtube.com/watch?v=${VideoId}`, "_blank").focus();

    }

    async Analyze() {

        Dispatcher.Call(Config.ON_LOADER_SHOW);
        Dispatcher.Call(Config.ON_LOADER_UPDATE, "AI is analyzing video");

        try {

            const { VideoId, Report } = this;

            if(!VideoId || !Report || !Report.videos[VideoId]) {
                throw new Error("Invalid video id or report");
            };

            const _response = await fetch(`/api/analytics/analyze/video?videoId=${VideoId}`);
            const { success, data, message } = await _response.json();

            if(!success || !_response.ok) {
                throw new Error(message);
            };

            Dispatcher.Call(Config.ON_ANALYTICS_REPORT, data);

        }
        catch(error) {
            alert(error);
            console.error(error);
        };

        Dispatcher.Call(Config.ON_LOADER_HIDE);

    }

    Comment = {
        Load: async () => {

            try {

                const { Report, VideoId } = this;
                if(!Report || !VideoId) {
                    throw new Error("Invalid video or report")
                };
    
                const _response = await fetch(`/api/analytics/video/comment?videoId=${VideoId}&channelId=${Report.channel.detail.id}`);
                const { success, message, data } = await _response.json();

                if(!success || !_response.ok) {
                    throw new Error(message);
                };
    
                this.Set("{c.comment}", "", Comment);

                for(var commet in data) {
                    this.Set("{c.comment}++", <><Comment args data={ data[commet] }></Comment></>);
                };

            }
            catch(error) {
                alert(error);
                console.error(error);
            }

        }
    }

    async OnVideoSelect(event, id) {
        
        try {

            const { element, Report } = this;
            const { VThumbnail, VDescription } = element;
    
            if(!id || !Report || !Report.videos[id]) {
                throw new Error("Invalid video id or report");
            };

            this.VideoId = id;
    
            const { videos } = Report;
            const { title, description, thumbnail, stat } = videos[id];

            this.Set("{v.title}", title);
            VDescription.innerText = description;
    
            VThumbnail.style.backgroundImage = `url(${thumbnail})`;
    
            if(!stat) {
                
                Dispatcher.Call(Config.ON_LOADER_SHOW);
                Dispatcher.Call(Config.ON_LOADER_UPDATE, "Loading video statistics");

                const _response = await fetch(`/api/analytics/video?videoId=${id}`);
                const { success, data, message } = await _response.json();
    
                if(!success || !_response.ok) {
                    throw new Error(message);
                };

                const { stat: nStat } = data[id];
                if(!nStat) {
                    throw new Error("Unable to load stat");
                };

                const { count } = nStat;
                this.Set("{v.view}", count.view);
                this.Set("{v.like}", count.like);
                this.Set("{v.dislike}", count.dislike);
                this.Set("{v.comment}", count.comment);

            }
            else {
                
                const { count } = stat;
                this.Set("{v.view}", count.view);
                this.Set("{v.like}", count.like);
                this.Set("{v.dislike}", count.dislike);
                this.Set("{v.comment}", count.comment);

            };

            await this.Comment.Load();

        }
        catch(error) {
            console.error(error);
        };

        Dispatcher.Call(Config.ON_LOADER_HIDE);

    }
    async OnAnalyticReport(event, report) {
        if(report) {
            this.Report = report;
            this.OnVideoSelect(null, this.VideoId)
        };
    }

};