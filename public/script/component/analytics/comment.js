import "@style/main.css";
import H12 from "@library/h12";
import Config from "@library/config";
import Dispatcher from "@library/h12.dispatcher";

@Component
export default class Comment extends H12 {
    constructor() {
        super();
        this.VideoId = null;
    }
    async init() {

    }
    async render() {

        // Break the youtube's comment data
        // And assign it to the template
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

        // Disable component elements and
        // show loader while performing the task
        const { CBox, CAi, CSend } = this.element;

        CAi.disabled = true;
        CSend.disabled = true;
        Dispatcher.Call(Config.ON_LOADER_SHOW);
        Dispatcher.Call(Config.ON_LOADER_UPDATE, "Sending comment");

        try {

            // Check if the comment data is valid and the
            // comment is not empty
            if(!this.args.data || CBox.value.length < 3) {
                throw new Error("Invalid comment data");
            };

            // Get the video id and the comment id from the
            // comment data
            const { snippet: { videoId }, id } = this.args.data;

            // Call the api request and check for the success
            // and response status. The api will add comment
            // to the youtube video
            const _response = await fetch(`/api/analytics/video/comment/send?videoId=${videoId}&commentId=${id}&comment=${CBox.value}`);
            const { success, message, data } = await _response.json();

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

        // Enable the elements after the task is completed,
        // and hide the loader panel
        CAi.disabled = false;
        CSend.disabled = false;
        Dispatcher.Call(Config.ON_LOADER_HIDE);

    }

    async Prompt() {

        // Disable component elements and
        // show loader while performing the task
        const { CBox, CAi, CSend } = this.element;

        CAi.disabled = true;
        CSend.disabled = true;
        Dispatcher.Call(Config.ON_LOADER_SHOW);
        Dispatcher.Call(Config.ON_LOADER_UPDATE, "AI is generating comment");

        try {

            // Check if the comment data is valid
            if(!this.args.data) {
                throw new Error("Invalid comment data");
            };

            // Get the video id and the comment id from the
            // comment data
            const { snippet: { videoId }, id } = this.args.data;

            // Call the api request and check for the success
            // and response status. The api will create a response
            // for the comment using AI
            const _response = await fetch(`/api/analytics/video/comment/prompt?videoId=${videoId}&commentId=${id}`);
            const { success, message, data } = await _response.json();

            if(!success || !_response.ok) {
                throw new Error(message);
            };

            // Set the comment value and call the dispatcher event
            // to update the report data. The dispatcher event
            // will be called across the app
            CBox.value = data.comment;
            Dispatcher.Call(Config.ON_ANALYTICS_CPROMPT, data.data);

        }
        catch(error) {
            alert(error);
            console.error(error);
        };

        // Enable the elements after the task is completed,
        // and hide the loader panel
        CAi.disabled = false;
        CSend.disabled = false;
        Dispatcher.Call(Config.ON_LOADER_HIDE);

    }
};