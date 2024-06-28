import "@style/main.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
import MyCreator from "@library/mycreator";

import Slide from "./editor/slide";
import Prompt from "./editor/prompt";
import Viewport from "./editor/viewport";
import Project from "./editor/project";
import Drive from "@component/drive";

@Component
export default class Editor extends H12 {
    
    constructor() {
        super();
        this.Project = null;
        this.ProjectAsset = null;
        this.SlideIndex = 0;
    }

    async init(args = { project }) {

        // Check if the project is valid
        if(MyCreator.Project.IsValid(args.project)) {

            // Set project for editor and load
            this.Project = args.project;
            await this.Load();

        }
        else {
            // Show message
            alert("Unable to get project");
        };

    }

    async render() {
        return <>
            <div class="w-full h-full relative">
                <div class="w-full h-full flex flex-row">

                    <div class="bg-zinc-900 flex-col sm:flex hidden p-4">
                        <button class="text-left p-2 px-3 rounded-md w-28 text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-blue-500 fa fa-grip"></i>Dashboard</button>
                        <button onclick={ () => { this.Tab(0); } } class="text-left p-2 px-3 rounded-md w-28 text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-red-500 fa-solid fa-wand-magic-sparkles"></i>Prompt</button>
                        <button onclick={ () => { this.Tab(1); } } class="text-left p-2 px-3 rounded-md w-28 text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-green-500 fa-solid fa-film"></i>Slide</button>
                        <button onclick={ () => { this.Tab(2); } } class="text-left p-2 px-3 rounded-md w-28 text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-yellow-500 fa-solid fa-folder-open"></i>Project</button>
                        <button onclick={ () => { this.Tab(3); } } class="text-left p-2 px-3 rounded-md w-28 text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-cyan-500 fa-solid fa-download"></i>Export</button>
                        <button onclick={ () => { this.Tab(4); } } class="text-left p-2 px-3 rounded-md w-28 text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-indigo-500  fa-solid fa-gear"></i>Settings</button>
                    </div>
                    <div class="min-w-[340px] max-w-[340px] bg-zinc-800 border-r border-zinc-700 flex-col sm:flex hidden" id="EditorTab">
                        
                        <Prompt args id="Prompt" project={ this.args.project }></Prompt>
                        <Slide args id="Slide" project={ this.args.project }></Slide>
                        <Project args id="Project" project={ this.args.project }></Project>

                        <div class="w-full h-full overflow-hidden hidden" id="projectTExport">
                            <div class="w-full h-full p-4 px-5 flex flex-col space-y-3 overflow-auto">

                                <div class="border border-transparent border-b-zinc-700 pb-2">
                                    <label class="font-semibold text-zinc-400">Export</label>
                                </div>

                                <div class="pt-3">
                                    <button class="p-2 px-6 text-xs text-zinc-200 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors">Export Video</button>
                                </div>

                            </div>
                        </div>

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

                    <Viewport args id="Viewport" project={ this.args.project }></Viewport>

                </div>
                <div class="absolute w-full h-full bg-zinc-900 backdrop-blur-sm bg-opacity-50 top-0 left-0 pointer-events-none flex justify-center items-center hidden" id="EditorUploader">
                    <div class="flex flex-col text-center">
                        <i class="fa fa-upload text-zinc-100 text-2xl font-semibold space-y-2"></i>
                        <label class="text-zinc-100 text-xs font-semibold">Upload</label>
                    </div>
                </div>
                <Drive args id="GDrive" project={ this.args.project }></Drive>
            </div>
        </>;
    }

    Tab(index = 0) {

        const _children = Array.from(this.element.EditorTab.children);

        if(index >= 0 && index < _children.length) {
            _children.forEach(x => {
                x.classList.add("hidden");
            });
            _children[index].classList.remove("hidden");
        };

    }

    async Load() {

        this.BindDrag();
        this.LoadAsset();

    }

    async LoadAsset() {

        // Try and load project assets
        try {

            // Load project assets
            const _request = await fetch(`/api/asset/fetch?pid=${this.Project.id}`);
            const _response = await _request.json();
    
            if(!_response.success) {
                throw new Error(_response.message);
            };
    
            // Store loaded asset
            this.ProjectAsset = _response.data;

            // Distribute loaded asset
            Dispatcher.Call("OnAssetLoad", _response.data);

        }
        catch(error) {
            alert("Unable to load project assets");
            console.error("Editor/LoadAsset():", error);
        };

    }

    OpenDrive() {

        this.child["GDrive"].Show(this.Project);

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
            this.root.addEventListener(name, () => this.element.EditorUploader.classList.remove("hidden"), false);
        });
        ["dragleave", "drop"].forEach(name => {
            this.root.addEventListener(name, () => this.element.EditorUploader.classList.add("hidden"), false);
        });
        this.root.addEventListener("drop", this.HandleDrop.bind(this), false);

    }

    async HandleDrop(event) {

        // Check if the project is valid
        if(!MyCreator.Project.IsValid(this.Project)) {
            console.error("Editor/HandleDrop(): Invalid project");
            return false;
        };

        const _data = event.dataTransfer;
        const _file = _data.files;

        // Filter the files to be uploaded
        const _filesToUpload = [..._file].filter(x => {
            if(x.type.startsWith("image/") || x.type.startsWith("video/")) {
                return true;
            }
            else {
                console.warn(`Editor/HandleDrop(): File ${x.name} is not supported and was not uploaded.`);
                return false;
            };
        });

        // Upload all files and wait for the uploads to complete
        try {
            await Promise.all(_filesToUpload.map(file => this.UploadFile(file)));
            //this.Load();
        }
        catch(error) {
            console.error("Editor/HandleDrop(): An error occurred during file upload:", error);
        };

    }

    async UploadFile(file) {

        try {

            // Build request body
            const _url = `/api/asset/upload?pid=${this.Project.id}`;
            const _form = new FormData();
            _form.append("files", file);

            // Send request
            const _request = await fetch(_url, { method: "POST", body: _form });
            const _response = await _request.json();

            // Check or request
            if(!_response.success) {
                throw new Error(_response.message);
            };

            // Update assets
            await this.LoadAsset();

        }
        catch(error) {
            alert(error);
            console.error(error);
        };

    }
    //#endregion

};