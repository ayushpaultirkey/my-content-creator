import "@style/main.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
import Config from "@library/@config";

@Component
export default class Comment extends H12 {
    
    constructor() {
        super();
        this.VideoId = null;
    }

    async init() {

    }

    async render() {

        const { snippet: { topLevelComment: { snippet: { authorDisplayName, textOriginal } } } } = this.args.data;

        return <>
            <div class="flex flex-col border-b pb-2 border-zinc-700">
                <label class="text-sm font-semibold text-zinc-500">{ authorDisplayName }</label>
                <label class="text-xs font-semibold text-zinc-600">{ textOriginal }</label>
                <div class="mt-1 flex flex-row bg-zinc-800 rounded-lg">
                    <div class="w-full">
                        <textarea type="text" class="w-full text-xs bg-transparent p-2 px-3 min-h-11 max-h-40 placeholder:text-zinc-500" placeholder="Write reply" id="CBox"></textarea>
                    </div>
                    <div class="flex flex-row">
                        <button class="text-xs w-20 flex px-2 justify-center items-center hover:text-blue-600 h-full" id="CAi" onclick={ this.Prompt }><i class="fa fa-splotch text-md mr-2"></i><label>Prompt</label></button>
                        <button class="text-xs w-20 flex px-2 justify-center items-center hover:text-blue-600 h-full" id="CSend" onclick={ this.Send }><i class="fa fa-paper-plane text-md mr-2"></i><label>Send</label></button>
                    </div>
                </div>
            </div>
        </>;

    }

    async Send() {

        const { CBox, CAi, CSend } = this.element;

        CAi.disabled = true;
        CSend.disabled = true;
        Dispatcher.Call(Config.ON_LOADER_SHOW);
        Dispatcher.Call(Config.ON_LOADER_UPDATE, "Sending comment");

        try {

            if(!this.args.data || CBox.value.length < 3) {
                throw new Error("Invalid comment data");
            };

            const { snippet: { videoId }, id } = this.args.data;

            const _response = await fetch(`/api/analytics/video/comment/send?videoId=${videoId}&commentId=${id}&comment=${CBox.value}`);
            const { success, message, data } = await _response.json();

            if(!success || !_response.ok) {
                throw new Error(message);
            };

            Dispatcher.Call(Config.ON_ANALYTICS_REPORT, data);

        }
        catch(error) {
            alert(error);
            console.error(error);
        };

        CAi.disabled = false;
        CSend.disabled = false;
        Dispatcher.Call(Config.ON_LOADER_HIDE);

    }

    async Prompt() {

        const { CBox, CAi, CSend } = this.element;

        CAi.disabled = true;
        CSend.disabled = true;
        Dispatcher.Call(Config.ON_LOADER_SHOW);
        Dispatcher.Call(Config.ON_LOADER_UPDATE, "AI is generating comment");

        try {

            if(!this.args.data) {
                throw new Error("Invalid comment data");
            };

            const { snippet: { videoId }, id } = this.args.data;

            const _response = await fetch(`/api/analytics/video/comment/prompt?videoId=${videoId}&commentId=${id}`);
            const { success, message, data } = await _response.json();

            if(!success || !_response.ok) {
                throw new Error(message);
            };

            CBox.value = data.comment;
            Dispatcher.Call(Config.ON_ANALYTICS_CPROMPT, data.data);

        }
        catch(error) {
            alert(error);
            console.error(error);
        };

        CAi.disabled = false;
        CSend.disabled = false;
        Dispatcher.Call(Config.ON_LOADER_HIDE);

    }

};