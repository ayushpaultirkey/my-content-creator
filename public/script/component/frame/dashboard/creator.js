import "@style/main.css";
import H12 from "@library/h12";
import Frame from "@library/frame";
import Config from "@library/config";
import Dispatcher from "@library/h12.dispatcher";
import ServerEvent from "@library/serverevent.p";

import Attachment from "@component/attachment";

@Component
export default class Creator extends H12 {
    constructor() {
        super();
    }
    async init() {

        // Set the default values for key for
        // the template fields
        this.Set("{u.name}", "");
        this.Set("{u.visible}", "hidden");
        this.Set("{d.visible}", "hidden");

    }
    async render() {
        return <>
            <div class="absolute top-0 left-0 w-full h-full bg-zinc-900 text-zinc-800 bg-opacity-90 flex justify-center items-center {d.visible}">
                <div class="w-full h-full sm:h-auto bg-zinc-300 p-4 sm:p-6 space-y-4">
                    <label class="text-md sm:text-xl font-semibold">Create new project</label>
                    <div class="flex flex-col space-y-3">

                        <div class="flex flex-col space-y-1">
                            <label class="text-xs sm:text-sm font-semibold">Project description:</label>
                            <textarea class="resize-none h-20 p-2 text-xs sm:text-sm font-semibold bg-zinc-200 border-2 border-zinc-400 rounded-lg placeholder:text-zinc-700 placeholder:text-opacity-70" id="CPrompt" placeholder="Describe on what topic you want to create the video..."></textarea>
                            <div>
                                <button class="p-2 px-6 text-xs text-blue-100 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors mr-1" onclick={ () => { this.child["CUploader"].Open(); } }><i class="fa fa-paperclip mr-2"></i>Attach File</button>
                                <Attachment args id="CUploader"></Attachment>
                            </div>
                        </div>

                        <div class="flex flex-col space-y-1">
                            <label class="text-xs sm:text-sm font-semibold">Dimensions:</label>
                            <div>
                                <input type="number" class="w-24 p-2 text-xs font-semibold bg-zinc-200 border-2 border-zinc-400 rounded-lg placeholder:text-zinc-700 placeholder:text-opacity-70" value="720" id="CWidth" placeholder="Width" />
                                <label class="text-sm font-semibold mx-2">x</label>
                                <input type="number" class="w-24 p-2 text-xs font-semibold bg-zinc-200 border-2 border-zinc-400 rounded-lg placeholder:text-zinc-700 placeholder:text-opacity-70" value="1280" id="CHeight" placeholder="Height" />
                            </div>
                        </div>

                        <div class="space-x-2">
                            <button class="p-2 px-6 text-xs text-blue-100 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors" id="DCreate" onclick={ this.Create }><i class="fa fa-plus mr-2"></i>Create</button>
                            <button class="p-2 px-6 text-xs text-zinc-300 font-semibold rounded-md bg-zinc-600 hover:bg-zinc-700 active:bg-zinc-800 transition-colors" onclick={ () => { this.Toggle(false); } }><i class="fa fa-xmark mr-2"></i>Cancel</button>
                        </div>

                    </div>
                    <div class="flex flex-col space-y-1">
                        <label class="text-xs sm:text-sm font-semibold">Examples:</label>
                        <button class="text-xs text-left" onclick={ () => { this.AddPrompt(0); } }>&bull; Can you help me in generate a video content for health and fitness ? The video length is around 1 minute.</button>
                        <button class="text-xs text-left" onclick={ () => { this.AddPrompt(1); } }>&bull; Can you create a content for video on recent space discoveries ?</button>
                        <button class="text-xs text-left" onclick={ () => { this.AddPrompt(2); } }>&bull; Surprise me !</button>
                    </div>
                </div>
            </div>
        </>;
    }
    async Create() {

        const { CWidth, CHeight, CPrompt, DCreate } = this.element;
        const { CUploader } = this.child;

        try {

            // Show loader while performing the task
            // and disable the input elements
            Dispatcher.Call(Config.ON_LOADER_SHOW);
            Dispatcher.Call(Config.ON_LOADER_UPDATE, "Creating Project");
            DCreate.disabled = true;

            // Get the width, heght and prompt value
            // from the elements
            const _width = CWidth.value;
            const _height = CHeight.value;
            const _prompt = CPrompt.value;

            // Check if the prompt is not emprt and the
            // file is valie
            if(_prompt.length < 5 && !CUploader.File) {
                throw new Error("Project description or attachment is required");
            };

            // Check for the video dimentsion
            if(_width < 128 || _height < 128) {
                throw new Error("Dimension should be greater than 128");
            };

            // Call the api request and check for the success
            // and response status. The api will start the creation
            // of the new project
            const _url = `/api/frame/project/create?prompt=${_prompt}&width=${_width}&height=${_height}`;
            const _form = new FormData();
            _form.append("files", CUploader.File);

            const _response = await fetch(_url, { method: "POST", body: _form });
            if(!_response.ok) {
                throw new Error("Error while creating project");
            };

            // Register a server side event to view
            // the project creation process
            ServerEvent(`/api/frame/project/create`, {
                onMessage: (data) => {

                    Dispatcher.Call(Config.ON_LOADER_UPDATE, data.message);

                },
                onFinish: (data) => {

                    // After the process is finishesd update
                    // and perform other task
                    Frame.SetLocalProject(data.data.id);
                    Dispatcher.Call(Config.ON_LOADER_HIDE);
                    DCreate.disabled = false;
                    this.Toggle(false);
                    this.parent.Load();

                },
                onError: (status, message) => {

                    if(status !== EventSource.CLOSED && message) {
                        alert(message);
                    };
                    Dispatcher.Call(Config.ON_LOADER_HIDE);
                    DCreate.disabled = false;
                    this.Toggle(false);

                }
            });

        }
        catch(error) {
            alert(error);
            console.error(error);
            this.Toggle(false);
            Dispatcher.Call(Config.ON_LOADER_HIDE);
        };

    }
    Toggle(visible = true) {

        this.Set("{d.visible}", ((visible) ? "" : "hidden"));

    }
    SetPrompt(text = "") {

        this.element.CPrompt.value = text;

    }
    AddPrompt(index = 0) {

        const _prompt = [
            "Can you help me in generate a video content for health and fitness ? The video length is around 1 minute.",
            "Can you create a content for video on recent space discoveries ?",
            "Surprise me !"
        ];
        this.SetPrompt(_prompt[index]);

    }
};