import "@style/main.css";
import H12 from "@library/h12";
import Config from "@library/config";
import Dispatcher from "@library/h12.dispatcher";

import Attachment from "@component/attachment";

@Component
export default class Prompt extends H12 {
    constructor() {
        super();
        this.Project = null;
    }
    async init(args = { project }) {

        // Set the default values for the
        // template fields
        this.Set("{c.fname}", "");
        this.Set("{c.fvisible}", "hidden");
        this.Set("{p.loader}", "hidden");

        // Check if the project is valid and load it
        if(args.project) {

            this.Project = args.project;
            this.Load();

            // Register the dispatcher event
            // The dispacther event when the project is udapted
            Dispatcher.On(Config.ON_FPROJECT_UPDATE, this.OnProjectUpdate.bind(this));

        };

    }
    async render() {
        return <>
            <div class="w-full h-full overflow-hidden">
                <div class="w-full h-full p-4 px-5 flex flex-col space-y-3 overflow-auto">

                    <div class="border border-transparent border-b-zinc-700 pb-2">
                        <label class="font-semibold text-zinc-400">Prompt</label>
                    </div>

                    <div class="w-full h-full flex flex-col overflow-hidden">
                        <div class="h-full space-y-2 pb-2 flex flex-col overflow-auto" id="PromptHistory">
                            <div class="space-y-2">
                                {e.message}
                            </div>
                            <div class="flex justify-center items-center {p.loader}">
                                <i class="fa fa-spinner text-gray-400"></i>
                            </div>
                        </div>
                        <div>
                            <Attachment args id="FUploader"></Attachment>
                            <div class="bg-zinc-400 flex rounded-lg overflow-hidden">
                                <button class="text-xs font-semibold bg-transparent p-3 hover:bg-zinc-500 active:bg-zinc-600 fa fa-paperclip" onclick={ () => { this.child["FUploader"].Open(); } }></button>
                                <input id="PromptBox" type="text" class="text-xs font-semibold bg-transparent placeholder:text-zinc-600 w-full py-3 resize-none" placeholder="Ask anything..." />
                                <button class="text-xs font-semibold bg-transparent p-3 hover:bg-zinc-500 active:bg-zinc-600" id="PromptButton" onclick={ this.Update }>Ask</button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>;
    }
    async Load() {

        try {
                
            // Check if the project is valid
            if(!this.Project) {
                throw new Error("Invalid project");
            };

            // Clear the previous messages
            this.Set("{e.message}", "");
    
            // Get the messages from the project
            // and render them
            const { history } = this.Project;

            for(var i = 0, len = history.length; i < len; i++) {

                // Check type of message
                let { fileData, text } = history[i].parts[0];
                let _text = "";
                let _icon = "";
                let _visible = "hidden";
                try {
                    if(history[i].role === "user") {
                        if(!fileData) {
                            if(text.length == 0) {
                                continue;
                            };
                            _text = text;
                        }
                        else {
                            const _mime = fileData.mimeType;
                            if(_mime.includes("image")) {
                                _text = "Image File";
                                _icon = "fa-image";
                            }
                            else if(_mime.includes("video")) {
                                _text = "Video File";
                                _icon = "fa-video";
                            }
                            else if(_mime.includes("audio")) {
                                _text = "Audio File";
                                _icon = "fa-volume-high";
                            }
                            else {
                                _text = "Unknown File";
                                _icon = "fa-file";
                            };
                            _visible = "";
                        };
                    }
                    else {
                        let _json = JSON.parse(text);
                        _text = _json.response;
                    };
                }
                catch(error) {
                    console.error(error);
                    _text = "(JSON Data Error)";
                };

                // Append the new chat bubble
                this.Set("{e.message}++", <>
                    <div class={ `flex ${(history[i].role == "user") ? "justify-end mr-1" : ""}` }>
                        <div class={ `w-2/3 bg-zinc-500 text-xs font-semibold p-2 rounded-md ${history[i].role == "user" ? "rounded-br-none" : "rounded-bl-none"} shadow-md` }>
                            <i class={ `fa ${_icon} ${_visible} mr-1` }></i>
                            <label class="break-words">{ _text }</label>
                        </div>
                    </div>
                </>);
    
            };

            // Scroll to bottom after loading new chat
            // messages
            const { PromptHistory } = this.element;
            setTimeout(() => { PromptHistory.scrollTo(0, PromptHistory.scrollHeight); }, 10);

        }
        catch(error) {
            console.error(error);
        };

    }
    async Update() {

        const { Project, element, child } = this;
        const { PromptHistory, PromptBox, PromptButton } = element;

        // Disable input element while performing task
        // and display the loader
        PromptButton.disabled = true;
        PromptBox.disabled = true;
        Dispatcher.Call(Config.ON_LOADER_SHOW);
        Dispatcher.Call(Config.ON_LOADER_UPDATE, "AI is updating slide...");

        // Show the loader
        this.Set("{p.loader}", "");

        try {

            // Check if the project is valid
            if(!Project) {
                throw new Error("Invalid project");
            };

            const { id: pid } = Project;
            const { FUploader } = child;

            // Get the prompt value and the file
            const _file = FUploader.File;
            const _prompt = PromptBox.value;

            // Check if the prompt is not empty and
            // the file is valid
            if(_prompt.length < 3 && _file == null) {
                alert("Please enter the prompt or attach file");
                throw new Error("Project prompt or attachment is required");
            };

            // Append the new message send by the user
            this.Set("{e.message}++", <>
                <div class="flex justify-end">
                    <div class="w-2/3 bg-zinc-500 text-xs font-semibold p-2 rounded-md shadow-md">
                        <label class="break-words">{ _prompt }</label>
                    </div>
                </div>
            </>);

            // Clear the prompt value and scroll
            // to bottom
            PromptBox.value = "";
            PromptHistory.scrollTo(0, PromptHistory.scrollHeight);

            // Call the api request and check for the success
            // and response status. The api will generate answer
            // and might update the project
            const _url = `/api/frame/prompt?pid=${pid}&prompt=${_prompt}`;
            const _form = new FormData();
            _form.append("files", _file);

            const _response = await fetch(_url, { method: "POST", body: _form });
            const { success, message, data } = await _response.json();

            if(!success || !_response.ok) {
                throw new Error(message);
            };

            // Call dispatcher event to update the project
            Dispatcher.Call(Config.ON_FPROJECT_UPDATE, data);

        }
        catch(error) {
            console.error(error);
        };

        // Enable input element after performing task
        // and hide the loader
        this.Set("{p.loader}", "hidden");
        Dispatcher.Call(Config.ON_LOADER_HIDE);
        PromptButton.disabled = false;
        PromptBox.disabled = false;

    }
    OnProjectUpdate(event, project) {

        // Called from dispatcher event when the
        // project data is updated
        if(project) {
            this.Project = project;
            this.Load();
        };

    };
};