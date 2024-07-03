import "@style/main.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
import ServerEvent from "@library/serverevent";
import MyCreator from "@library/mycreator";
import Drive from "@component/drive";

import Card from "./dashboard/card";

@Component
export default class Dashboard extends H12 {

    constructor() {
        super();
        this.CreatorFile = null;
    }

    async init() {

        try {

            this.Set("{c.fname}", "");
            this.Set("{c.fvisible}", "hidden");
    
            this.Set("{d.create.toggle}", "hidden");
    
            await this.Load();
    
            this.Auth();
    
            this.element.CreatorFile.addEventListener("change", this.CreatorAttachFile.bind(this));

        }
        catch(error) {
            alert("Unable to load dashbaord");
            console.error("Dashboard/init():", error);
        }

    }

    async render() {
        return <>
            <div class="w-full h-full p-10">

                <div class="w-full h-full flex flex-col space-y-8">
                    <div class="w-full flex">
                        <label class="text-2xl font-semibold text-zinc-300 w-full">Dashboard</label>
                        <div>
                            <button class="text-xs text-blue-700 font-semibold py-2 w-44 border-2 border-blue-800 bg-blue-950 bg-opacity-40 hover:bg-opacity-70 active:bg-opacity-90 rounded-md {d.auth.visible}" onclick={ MyCreator.Auth }>
                                <i class="fa-brands fa-google mr-2 pointer-events-none"></i>
                                <label class="pointer-events-none">{d.auth}</label>
                            </button>
                        </div>
                    </div>
                    <div class="grid sm:grid-cols-[repeat(auto-fill,250px)] grid-cols-[repeat(auto-fill,auto)] gap-4">
                    
                        <div class="bg-blue-500 border-2 border-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors rounded-lg min-h-28 flex flex-col">
                            <button class="fa fa-plus w-full h-full text-2xl text-zinc-900" onclick={ () => { this.CreatorToggle(); } } title="Create Project"></button>
                        </div>
                        
                        {p.list}
                        
                    </div>
                </div>

                <div class="absolute top-0 left-0 w-full h-full bg-zinc-900 text-zinc-800 bg-opacity-90 flex justify-center items-center {d.create.toggle}">
                    <div class="w-full h-full sm:h-auto bg-zinc-300 p-6 space-y-4">
                        <label class="text-xl font-semibold">Create new project</label>
                        <div class="flex flex-col space-y-3">

                            <div class="flex flex-col space-y-1">
                                <label class="text-sm font-semibold">Project description:</label>
                                <textarea class="resize-none h-20 p-2 text-sm font-semibold bg-zinc-200 border-2 border-zinc-400 rounded-lg placeholder:text-zinc-700 placeholder:text-opacity-70" id="CreatorInput" placeholder="Describe on what topic you want to create the video..."></textarea>
                                <div>
                                    <button class="p-2 px-6 text-xs text-blue-100 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors mr-1" onclick={ () => { this.element.CreatorFile.click(); } }><i class="fa fa-paperclip mr-2"></i>Attach File</button>
                                    <button class="p-2 px-6 text-xs text-blue-100 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors hidden"><i class="fa-brands fa-google-drive mr-2"></i>Google Drive</button>
                                    <input type="file" class="hidden" id="CreatorFile" />
                                    <div class="mt-1">
                                        <span class="bg-zinc-700 px-4 pb-1 rounded-2xl relative {c.fvisible}">
                                            <label class="text-xs font-semibold text-zinc-400">{c.fname}</label>
                                            <button class="text-sm font-semibold text-zinc-400 pl-2" onclick={ this.CreatorAttachRemove }>&times;</button>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="flex flex-col space-y-1">
                                <label class="text-sm font-semibold">Dimensions:</label>
                                <div>
                                    <input type="number" class="w-24 p-2 text-xs font-semibold bg-zinc-200 border-2 border-zinc-400 rounded-lg placeholder:text-zinc-700 placeholder:text-opacity-70" value="720" id="CreatorWidth" placeholder="Width" />
                                    <label class="text-sm font-semibold mx-2">x</label>
                                    <input type="number" class="w-24 p-2 text-xs font-semibold bg-zinc-200 border-2 border-zinc-400 rounded-lg placeholder:text-zinc-700 placeholder:text-opacity-70" value="1280" id="CreatorHeight" placeholder="Height" />
                                </div>
                            </div>

                            <div class="space-x-2">
                                <button class="p-2 px-6 text-xs text-blue-100 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors" id="DCreate" onclick={ this.CreateProject }><i class="fa fa-plus mr-2"></i>Create</button>
                                <button class="p-2 px-6 text-xs text-zinc-300 font-semibold rounded-md bg-zinc-600 hover:bg-zinc-700 active:bg-zinc-800 transition-colors" onclick={ () => { this.CreatorToggle(false); } }><i class="fa fa-xmark mr-2"></i>Cancel</button>
                            </div>

                        </div>
                        <div class="flex flex-col space-y-1">
                            <label class="text-sm font-semibold">Examples:</label>
                            <button class="text-xs text-left" onclick={ () => { this.CreatorAddPrompt(0); } }>&bull; Can you help me in generate a video content for health and fitness ? The video length is around 1 minute.</button>
                            <button class="text-xs text-left" onclick={ () => { this.CreatorAddPrompt(1); } }>&bull; Can you create a content for video on recent space discoveries ?</button>
                            <button class="text-xs text-left" onclick={ () => { this.CreatorAddPrompt(2); } }>&bull; Surprise me !</button>
                        </div>
                    </div>
                </div>
                
            </div>
        </>;
    }

    async Load() {

        // Try and load projects
        try {

            this.Set("{p.list}", "");

            // Get validated projects and add it to list
            const _project = await MyCreator.Project.GetValidated();
            for(var i = 0; i < _project.length; i++) {
                this.Set("{p.list}++", <><Card args project={ _project[i] }></Card></>);
            };

        }
        catch(error) {
            console.error("Dashboard/Load():", error);
            alert("Unable to load projects, try again later");
        };

    }

    async CreateProject() {

        // Try and create project using prompt
        try {

            Dispatcher.Call("OnLoaderShow");
            Dispatcher.Call("OnLoaderUpdate", "Creating Project");

            this.element.DCreate.disabled = true;

            // Get prompt, width, height
            const _width = this.element.CreatorWidth.value;
            const _height = this.element.CreatorHeight.value;
            const _prompt = this.element.CreatorInput.value;

            // Check for project description
            if(_prompt.length < 5 && this.CreatorFile == null) {
                alert("Please enter the project description or attach file");
                throw new Error("Project description or attachment is required");
            };

            // Check video dimension
            if(_width < 128 || _height < 128) {
                alert("Please check the dimension is greather than 128");
                throw new Error("Dimension should be greater than 128");
            };

            // Prepare data
            const _url = `/api/project/create?prompt=${_prompt}&width=${_width}&height=${_height}`;
            const _form = new FormData();
            _form.append("files", this.CreatorFile);

            // Send request
            const _request = await fetch(_url, { method: "POST", body: _form });
            if(!_request.ok) {
                throw new Error("Error while creating project");
            }

            const _source = new EventSource(`/api/project/create`);
            _source.onmessage = (event) => {

                // Try and get response
                try {

                    // Get response data and check if success and finished
                    const _data = JSON.parse(event.data.split("data:"));
                    if(!_data.success) {
                        throw new Error(_data.message);
                    };

                    // Check if the file is uploaded
                    if(_data.finished && _data.data && _data.data.id) {

                        // Store the project data
                        MyCreator.Project.SetLocal(_data.data.id);

                        Dispatcher.Call("OnLoaderHide");
                        alert("Project created");
                        this.Load();
                        this.CreatorToggle(false);
                        _source.close();

                    };

                    // Call dispather show loader
                    Dispatcher.Call("OnLoaderUpdate", _data.message);

                }
                catch(error) {

                    // Alert, hide loader and enable button
                    alert(error);
                    Dispatcher.Call("OnLoaderHide");
                    this.element.DCreate.disabled = false;
                    this.CreatorToggle(false);
                    _source.close();

                };
                
            };
            _source.onerror = () => {
                
                Dispatcher.Call("OnLoaderHide");
                this.element.DCreate.disabled = false;
                _source.close();
                this.CreatorToggle(false);

            };

        }
        catch(error) {
            console.error("Dashboard/CreateProject():", error);
            this.CreatorToggle(false);
        };

    }

    CreatorToggle(visible = true) {

        this.Set("{d.create.toggle}", ((visible) ? "" : "hidden"));

    }

    CreatorAttachFile(event) {
        
        const _file = event.target.files[0];

        if(_file.type.startsWith("image/") || _file.type.startsWith("video/") || _file.type.startsWith("audio/")) {


            if(_file) {

                this.CreatorFile = _file;
    
                this.Set("{c.fname}", _file.name);
                this.Set("{c.fvisible}", "");
    
                console.log(`Dashboard/CreateFileAttach():Selected file: ${_file.name}`);
    
            };

        }
        else {
            console.warn(`Editor/HandleDrop(): File ${_file.name} is not supported and was not uploaded.`);
            alert("File format not supported");
        };

    }

    CreatorAttachRemove() {

        this.CreatorFile = null;
        this.Set("{c.fname}", "");
        this.Set("{c.fvisible}", "hidden");
    }

    CreatorAddPrompt(index = 0) {

        const _prompt = [
            "Can you help me in generate a video content for health and fitness ? The video length is around 1 minute.",
            "Can you create a content for video on recent space discoveries ?",
            "Surprise me !"
        ];
        this.element.CreatorInput.value = _prompt[index];

    }

    Auth() {

        ServerEvent.Bind("AuthStatus", "open", () => {
            console.warn("Dashboars/AuthStatus connection created");
            this.Set("{d.auth.visible}", "");
        });

        ServerEvent.Bind("AuthStatus", "message", (event) => {
            try {
                const _data = JSON.parse(event.data.split("data:"));
                this.Set("{d.auth}", ((_data.success) ? "Connected to Google" : "Connect to Google"));
            }
            catch(error) {
                console.error("Dashboard/BindAuthStatus():", error);
                ServerEvent.Destroy("AuthStatus");
                this.Set("{d.auth.visible}", "hidden");
            };
        });

        ServerEvent.Bind("AuthStatus", "error", () => {
            console.error("Dashboard/BindAuthStatus(): AuthStatus error");
            ServerEvent.Destroy("AuthStatus");
            this.Set("{d.auth.visible}", "hidden");
        });

    }

};