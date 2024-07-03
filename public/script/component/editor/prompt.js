import "@style/main.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
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

        // Check if the project is valid and load it
        if(args.project) {

            // Set project and load
            this.Project = args.project;
            this.Load();

            // Register on dispatcher event
            Dispatcher.On("OnProjectUpdated", this.OnProjectUpdated.bind(this));

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
                        <div class="h-full space-y-2 pb-2 flex flex-col overflow-auto">
                            {e.message}
                        </div>
                        <div>
                            <Attachment args id="Uploader"></Attachment>
                            <div class="bg-zinc-400 flex rounded-lg overflow-hidden">
                                <button class="text-xs font-semibold bg-transparent p-3 hover:bg-zinc-500 active:bg-zinc-600 fa fa-paperclip" onclick={ () => { this.child["Uploader"].Open(); } }></button>
                                <input id="PromptBox" type="text" class="text-xs font-semibold bg-transparent placeholder:text-zinc-600 w-full py-3 resize-none" placeholder="Ask anything..." />
                                <button class="text-xs font-semibold bg-transparent p-3 hover:bg-zinc-500 active:bg-zinc-600" onclick={ this.Update }>Ask</button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>;
    }

    async Load() {

        // Check if the project is valid
        if(!this.Project) {
            return false;
        };

        // Try and render the messages
        try {

            // Clear the old messages before loading
            this.Set("{e.message}", "");
    
            // Get message array from the project
            const _history = this.Project.history;

            // Iterate over all project messages
            for(var i = 0, len = _history.length; i < len; i++) {

                // Check type of message
                let { fileData, text } = _history[i].parts[0];
                let _text = "";
                let _icon = "";
                let _visible = "hidden";
                try {
                    if(_history[i].role === "user") {
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
                    _text = "<json parse error>";
                };

                // Add chat bubble
                this.Set("{e.message}++", <>
                    <div class={ `flex ${(_history[i].role == "user") ? "justify-end" : ""}` }>
                        <div class={ `w-2/3 bg-zinc-500 text-xs font-semibold p-2 rounded-md shadow-md` }>
                            <i class={ `fa ${_icon} ${_visible} mr-1` }></i>
                            <label class="break-words">{ _text }</label>
                        </div>
                    </div>
                </>);
    
            };
        }
        catch(error) {
            console.error("E/P.Load():", error);
        };

    }

    async Update() {

        // Check if the project is valid
        if(!this.Project) {
            return false;
        };
        
        // Call dispather show loader
        Dispatcher.Call("ShowLoader", "AI is updating slide...");

        try {

            // Get project id and the slide's id by the index
            const _projectId = this.Project.id;
            const _prompt = this.element.PromptBox.value;
            const _file = this.child["Uploader"].File;

            // Check for project description and file
            if(_prompt.length < 5 && _file == null) {
                alert("Please enter the project description or attach file");
                throw new Error("Project description or attachment is required");
            };

            // Prepare data
            const _url = `/api/google/gemini?pid=${_projectId}&prompt=${_prompt}`;
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
            Dispatcher.Call("OnProjectUpdated", data);

        }
        catch(error) {
            console.error("E/P.Update():", error);
        };

        // Call dispather hide loader
        Dispatcher.Call("HideLoader");

    }

    OnProjectUpdated(event, project) {

        // Check if the project is valid and load it
        if(project) {

            this.Project = project;
            this.Load();

        };

    };

};