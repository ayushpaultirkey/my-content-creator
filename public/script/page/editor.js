import "@style/main.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";

import DViewer from "@component/google/drive/viewer";
import YTUploader from "@component/google/youtube/uploader";

import Slide from "@component/editor/slide";
import Prompt from "@component/editor/prompt";
import Viewport from "@component/editor/viewport";
import Project from "@component/editor/project";
import Export from "@component/editor/export";
import Config from "@library/@config";
import ServerEvent from "@library/sse";

@Component
export default class Editor extends H12 {
    
    constructor() {
        super();
        this.Project = null;
        this.ProjectAsset = null;
        this.SlideIndex = 0;
    }

    async init(args) {

        this.Set("{e.gdrive}", "G");
        this.Set("{e.ytupload}", "Y")

        // Check if the project is valid
        if(args.project) {

            // Set project for editor and load
            this.Project = args.project;
            await this.Load();

            // Bind dispatcher
            Dispatcher.On(Config.ON_FASSET_UPDATE, this.LoadAsset.bind(this));

        }
        else {
            
            alert("Unable to get project");

        };

    }

    async render() {
        return <>
            <div class="w-full h-full relative GGH">
                
                <div class="w-full h-full flex flex-row relative">

                    <div class="w-full h-full bg-zinc-900 flex-col flex p-4 absolute -left-full md:w-auto md:h-auto md:static md:left-auto" id="NavigationTab">
                        <button class="text-left p-2 px-3 rounded-md w-28 text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-blue-500 fa fa-grip"></i>Dashboard</button>
                        <button onclick={ () => { this.TabSwitch(0); } } class="text-left p-2 px-3 rounded-md w-28 text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-red-500 fa-solid fa-wand-magic-sparkles"></i>Prompt</button>
                        <button onclick={ () => { this.TabSwitch(1); } } class="text-left p-2 px-3 rounded-md w-28 text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-green-500 fa-solid fa-film"></i>Slide</button>
                        <button onclick={ () => { this.TabSwitch(2); } } class="text-left p-2 px-3 rounded-md w-28 text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-yellow-500 fa-solid fa-folder-open"></i>Project</button>
                        <button onclick={ () => { this.TabSwitch(3); } } class="text-left p-2 px-3 rounded-md w-28 text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-cyan-500 fa-solid fa-cloud-arrow-up"></i>Export</button>
                        <button onclick={ () => { this.TabSwitch(4); } } class="text-left p-2 px-3 rounded-md w-28 text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-indigo-500  fa-solid fa-gear"></i>Settings</button>
                    </div>

                    <div class="w-full h-full bg-zinc-800 border-r border-zinc-700 absolute -left-full md:min-w-[300px] md:max-w-[300px] lg:min-w-[360px] lg:max-w-[360px] md:static md:left-auto" id="PropertyTab">
                
                        <div id="EditorTab" class="w-full h-full">

                            <Prompt args id="Prompt" project={ this.args.project }></Prompt>
                            <Slide args id="Slide" project={ this.args.project }></Slide>
                            <Project args id="Project" project={ this.args.project }></Project>
                            <Export args id="Export" project={ this.args.project }></Export>

                            <div class="w-full h-full overflow-hidden hidden" id="projectTSetting">
                                <div class="w-full h-full p-4 px-5 flex flex-col space-y-3 overflow-auto">

                                    <div class="border border-transparent border-b-zinc-700 pb-2">
                                        <label class="font-semibold text-zinc-400">Settings</label>
                                    </div>

                                    <div class="pt-3">
                                        <button class="p-2 px-6 text-xs text-zinc-200 font-semibold rounded-md bg-red-500 hover:bg-red-600 active:bg-red-700 transition-colors">Delete Project</button>
                                    </div>

                                    <div class="flex flex-col">
                                        <label class="text-xs font-semibold text-zinc-400">Note:</label>
                                        <label class="text-xs text-zinc-400">The deleted project cannot be recovered, all the assets will be deleted.</label>
                                    </div>

                                </div>
                            </div>

                        </div>

                        <div class="absolute right-10 top-3 flex space-x-6 md:hidden">
                            <button class="fa-solid fa-bars text-blue-500 text-xl" onclick={ () => { this.Navigate(0); } }></button>
                            <button class="fa-solid fa-arrow-right text-blue-500 text-xl" onclick={ () => { this.Navigate(2); } }></button>
                        </div>
                    
                    </div>

                    <div class="w-full h-full absolute left-0 md:static md:left-auto overflow-hidden" id="ViewportTab">
                        <Viewport args id="Viewport" project={ this.args.project }></Viewport>
                        <div class="absolute left-10 top-10 flex space-x-6 md:hidden">
                            <button class="fa-solid fa-bars text-blue-500 text-xl" onclick={ () => { this.Navigate(0); } }></button>
                            <button class="fa-solid fa-pen-to-square text-blue-500 text-xl" onclick={ () => { this.Navigate(1); } }></button>
                        </div>
                    </div>

                </div>

                <div class="absolute w-full h-full bg-zinc-900 backdrop-blur-sm bg-opacity-50 top-0 left-0 pointer-events-none flex justify-center items-center collapse" id="EditorUploader">
                    <div class="flex flex-col text-center">
                        <i class="fa fa-upload text-zinc-100 text-2xl font-semibold space-y-2"></i>
                        <label class="text-zinc-100 text-xs font-semibold">Upload</label>
                    </div>
                </div>

                {e.gdrive}
                {e.ytupload}

            </div>
        </>;
    }


    async Load() {

        this.BindDrag();
        this.LoadAsset();

    }

    async LoadAsset() {

        // Try and load project assets
        try {
            
            const { id: pid } = this.Project;

            // Load project assets
            const _response = await fetch(`/api/frame/asset/fetch?pid=${pid}`);
            const { message, success, data } = await _response.json();
            
            if(!success || !_response.ok) {
                throw new Error(message);
            };
    
            // Store loaded asset
            this.ProjectAsset = data;

            // Distribute loaded asset
            Dispatcher.Call(Config.ON_FASSET_LOAD, data);

        }
        catch(error) {
            alert("Unable to load project assets");
            console.error("Editor/LoadAsset():", error);
        };

    }

    Navigate(index = 0) {

        const { NavigationTab, ViewportTab, PropertyTab } = this.element;

        switch(index) {
            case 0:
                NavigationTab.classList.add("left-0");
                NavigationTab.classList.remove("-left-full");
                ViewportTab.classList.add("-left-full");
                ViewportTab.classList.remove("left-0");
                PropertyTab.classList.add("-left-full");
                PropertyTab.classList.remove("left-0");
                break;
            case 1:
                NavigationTab.classList.add("-left-full");
                NavigationTab.classList.remove("left-0");
                ViewportTab.classList.add("-left-full");
                ViewportTab.classList.remove("left-0");
                PropertyTab.classList.add("left-0");
                PropertyTab.classList.remove("-left-full");
                break;
            case 2:
                NavigationTab.classList.add("-left-full");
                NavigationTab.classList.remove("left-0");
                PropertyTab.classList.add("-left-full");
                PropertyTab.classList.remove("left-0");
                ViewportTab.classList.add("left-0");
                ViewportTab.classList.remove("-left-full");
                break;
        };

    }

    TabSwitch(index = 0) {

        const _children = Array.from(this.element.EditorTab.children);

        if(index >= 0 && index < _children.length) {
            _children.forEach(x => {
                x.classList.add("hidden");
            });
            _children[index].classList.remove("hidden");
        };

        this.Navigate(1);

    }

    async OpenGDriveViewer() {
        
        if(!this.child["GDrive"]) {
            
            //
            this.Set("{e.gdrive}", <><DViewer args ref="DViewer" id="GDrive"></DViewer></>);
            this.child["GDrive"].OnImport = async function() {

                Dispatcher.Call(Config.ON_LOADER_SHOW);
                Dispatcher.Call(Config.ON_LOADER_UPDATE, "Downloading File");

                try {
                    
                    const { Project } = this.parent;
                    if(!Project) {
                        throw new Error("Invalid project")
                    };

                    const _fileId = this.Selected;
                    const  _response = await fetch(`/api/frame/drive/import?pid=${Project.id}&fid=${JSON.stringify(_fileId)}`);
                    const { success, message } = await _response.json();
            
                    if(!success || !_response.ok) {
                        throw new Error(message);
                    };
            
                    this.Hide();
                    alert("Files imported");
                    Dispatcher.Call(Config.ON_FASSET_UPDATE);
            
                }
                catch(error) {
                    alert(error);
                    console.error("F/E/OpenGDriveViewer().OnImport():", error);
                    Dispatcher.Call(Config.ON_LOADER_HIDE);
                };

                Dispatcher.Call(Config.ON_LOADER_HIDE);


            };
            
            //
            console.warn("E.OpenGDriveViewer(): DViewer imported");

        };
        this.child["GDrive"].Show(this.Project);
        
    }
    async OpenYTUploader() {

        if(!this.Project) {
            return false;
        };

        if(!this.child["GYoutube"]) {
            this.Set("{e.ytupload}", <><YTUploader args ref="YTUploader" id="GYoutube"></YTUploader></>);
            this.child["GYoutube"].OnUpload = async function({ title, description, category, onStart, onEnd }) {

                try {

                    onStart();

                    const { Project } = this.parent;
                    if(!Project) {
                        return false;
                    };

                    if(title.length < 2 || description.length < 2) {
                        throw new Error("Please enter title and description");
                    };
        
                    //
                    ServerEvent(`/api/frame/youtube/upload?pid=${Project.id}&t=${title}&d=${description}&c=${category}`, {
                        onOpen: () => {

                            Dispatcher.Call(Config.ON_LOADER_SHOW);
                            Dispatcher.Call(Config.ON_LOADER_UPDATE, "Uploading Video");

                        },
                        onMessage: (data) => {

                            Dispatcher.Call(Config.ON_LOADER_SHOW);
                            Dispatcher.Call(Config.ON_LOADER_UPDATE, data.message);
                            
                        },
                        onFinish: () => {

                            alert("Video uploaded to youtube !");
                            Dispatcher.Call(Config.ON_LOADER_HIDE);

                        },
                        onError: (status, message) => {

                            if(status !== EventSource.CLOSED && message) {
                                alert(message);
                            };
                            Dispatcher.Call(Config.ON_LOADER_HIDE);

                        }
                    });
        
                }
                catch(error) {
        
                    // Alert and log
                    alert(error);
                    console.error("F/E/OpenYTUploader().OnUpload():", error);
                    onEnd();
                    
                };

            };
            console.warn("E.OpenYTUploader(): YTUploader imported");
        };

        const { title, description } = this.Project.property;
        this.child["GYoutube"].Show({
            title: title,
            description: description
        });
    }

    //#region File Drag n Drop
    PreventDefault(event) {
        
        event.preventDefault();
        event.stopPropagation();

    }

    BindDrag() {

        // Set file drag n drop event
        ["dragenter", "dragover", "dragleave", "drop"].forEach(name => {
            this.root.addEventListener(name, this.PreventDefault, false);
        });
        ["dragenter", "dragover"].forEach(name => {
            this.root.addEventListener(name, () => this.element.EditorUploader.classList.remove("collapse"), false);
        });
        ["dragleave", "drop"].forEach(name => {
            this.root.addEventListener(name, () => this.element.EditorUploader.classList.add("collapse"), false);
        });
        this.root.addEventListener("drop", this.HandleDrop.bind(this), false);

    }

    async HandleDrop(event) {

        // Check if the project is valid
        if(!this.Project) {
            console.error("E.HandleDrop(): Invalid project");
            return false;
        };

        const _data = event.dataTransfer;
        const _file = _data.files;

        // Filter the files to be uploaded
        const _filesToUpload = [..._file].filter(x => {
            if(x.type.startsWith("image/") || x.type.startsWith("video/") || x.type.startsWith("audio/")) {
                return true;
            }
            else {
                console.warn(`E.HandleDrop(): ${x.name} not supported.`);
                return false;
            };
        });

        // Upload all files and wait for the uploads to complete
        try {

            await Promise.all(_filesToUpload.map(file => this.UploadFile(file)));

            Dispatcher.Call(Config.ON_FASSET_UPDATE);

        }
        catch(error) {
            console.error("E.HandleDrop(): Error file upload:", error);
        };

    }

    async UploadFile(file) {

        try {

            //
            const _url = `/api/frame/asset/upload?pid=${this.Project.id}`;
            const _form = new FormData();
            _form.append("files", file);

            //
            const _response = await fetch(_url, { method: "POST", body: _form });
            const { success, message } = await _response.json();

            //
            if(!success || !_response.ok) {
                throw new Error(message);
            };


        }
        catch(error) {
            alert(error);
            console.error(error);
        };

    }
    //#endregion

};