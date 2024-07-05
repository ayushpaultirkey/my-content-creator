import "@style/main.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
import Config from "@library/@config";
import Attachment from "@component/attachment";

@Component
export default class Prompt extends H12 {

    constructor() {
        super();
        this.Project = null;
    }

    async init(args = { project }) {

        // Set default value
        this.Set("{c.fname}", "");
        this.Set("{c.fvisible}", "hidden");
        this.Set("{p.loader}", "hidden");

        // Check if the project is valid and load it
        if(args.project) {

            // Set project and load
            this.Project = args.project;
            this.Load();

            // Register on dispatcher event
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
            
            //
            if(!this.Project) {
                throw new Error("Invalid project");
            };

            //
            this.Set("{e.message}", "");
    
            //
            const { history } = this.Project;

            // Iterate over all project messages
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
                    console.error("Editor/Prompt/Load():", error);
                    _text = "(JSON Data Error)";
                };

                // Add chat bubble
                this.Set("{e.message}++", <>
                    <div class={ `flex ${(history[i].role == "user") ? "justify-end mr-1" : ""}` }>
                        <div class={ `w-2/3 bg-zinc-500 text-xs font-semibold p-2 rounded-md ${history[i].role == "user" ? "rounded-br-none" : "rounded-bl-none"} shadow-md` }>
                            <i class={ `fa ${_icon} ${_visible} mr-1` }></i>
                            <label class="break-words">{ _text }</label>
                        </div>
                    </div>
                </>);
    
            };

            //
            const { PromptHistory } = this.element;
            setTimeout(() => { PromptHistory.scrollTo(0, PromptHistory.scrollHeight); }, 10);

        }
        catch(error) {
            console.error("E/P.Load():", error);
        };

    }

    async Update() {

        const { Project, element, child } = this;
        const { PromptHistory, PromptBox, PromptButton } = element;
        PromptButton.disabled = true;
        PromptBox.disabled = true;
        this.Set("{p.loader}", "");

        //
        Dispatcher.Call(Config.ON_LOADER_SHOW);
        Dispatcher.Call(Config.ON_LOADER_UPDATE, "AI is updating slide...");

        try {

            //
            if(!Project) {
                throw new Error("Invalid project");
            };

            const { id: pid } = Project;
            const { FUploader } = child;

            const _file = FUploader.File;
            const _prompt = PromptBox.value;

            //
            if(_prompt.length < 3 && _file == null) {
                alert("Please enter the prompt or attach file");
                throw new Error("Project prompt or attachment is required");
            };

            //
            this.Set("{e.message}++", <>
                <div class="flex justify-end">
                    <div class="w-2/3 bg-zinc-500 text-xs font-semibold p-2 rounded-md shadow-md">
                        <label class="break-words">{ _prompt }</label>
                    </div>
                </div>
            </>);
            PromptBox.value = "";
            PromptHistory.scrollTo(0, PromptHistory.scrollHeight);

            // Prepare data
            const _url = `/api/frame/prompt?pid=${pid}&prompt=${_prompt}`;
            const _form = new FormData();
            _form.append("files", _file);

            // Send request
            const _response = await fetch(_url, { method: "POST", body: _form });
            const { success, message, data } = await _response.json();

            // Check for the error
            if(!success || !_response.ok) {
                throw new Error(message);
            };

            // Update project data
            Dispatcher.Call(Config.ON_FPROJECT_UPDATE, data);

        }
        catch(error) {
            console.error("E/P.Update():", error);
        };

        //
        this.Set("{p.loader}", "hidden");
        Dispatcher.Call(Config.ON_LOADER_HIDE);
        PromptButton.disabled = false;
        PromptBox.disabled = false;

    }

    OnProjectUpdate(event, project) {

        //
        if(project) {
            this.Project = project;
            this.Load();
        };

    };

};