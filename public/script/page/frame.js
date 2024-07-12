import "@style/main.css";
import H12 from "@library/h12";
import Misc from "@library/misc";
import Config from "@library/config";
import Dispatcher from "@library/h12.dispatcher";

import Slide from "@component/frame/editor/slide";
import Prompt from "@component/frame/editor/prompt";
import Export from "@component/frame/editor/export";
import Project from "@component/frame/editor/project";
import Viewport from "@component/frame/editor/viewport";
import DragNDrop from "@component/frame/function/drag-n-drop";
import DynImport from "@component/frame/function/dynamic-import";
import Settings from "@component/frame/editor/settings";

@Component
export default class Frame extends H12 {
    constructor() {
        super();
        this.Project = null;
        this.ProjectAsset = null;
        this.SlideIndex = 0;
    }
    async init(args) {

        // Set default template value
        this.Set("{e.gdrive}", "G");
        this.Set("{e.ytupload}", "Y")

        // Check if the project is valid
        if(args.project) {

            // Set project
            this.Project = args.project;

            // Bind dispatcher
            Dispatcher.On(Config.ON_FPROJECT_UPDATE, this.OnProjectUpdate.bind(this));
            Dispatcher.On(Config.ON_FASSET_UPDATE, this.LoadAsset.bind(this));

            // Bind new event
            this.OpenYTUploader = DynImport.OpenYTUploader.bind(this);
            this.OpenGDriveViewer = DynImport.OpenGDriveViewer.bind(this);

            this.BindDrag = DragNDrop.BindDrag.bind(this);
            this.HandleDrop = DragNDrop.HandleDrop.bind(this);
            this.UploadFile = DragNDrop.UploadFile.bind(this);
            this.PreventDefault = DragNDrop.PreventDefault.bind(this);

            // Load prject
            await this.Load();

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
                        <button onclick={ () => { Dispatcher.Call("OnNavigate", { target: "DASHBOARD" }) } } class="text-left p-2 px-3 rounded-md md:w-28 w-full text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-blue-500 fa fa-grip"></i>Dashboard</button>
                        <button onclick={ () => { this.TabSwitch(0); } } class="text-left p-2 px-3 rounded-md md:w-28 w-full text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-red-500 fa-solid fa-wand-magic-sparkles"></i>Prompt</button>
                        <button onclick={ () => { this.TabSwitch(1); } } class="text-left p-2 px-3 rounded-md md:w-28 w-full text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-green-500 fa-solid fa-film"></i>Slide</button>
                        <button onclick={ () => { this.TabSwitch(2); } } class="text-left p-2 px-3 rounded-md md:w-28 w-full text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-yellow-500 fa-solid fa-folder-open"></i>Project</button>
                        <button onclick={ () => { this.TabSwitch(3); } } class="text-left p-2 px-3 rounded-md md:w-28 w-full text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-cyan-500 fa-solid fa-cloud-arrow-up"></i>Export</button>
                        <button onclick={ () => { this.TabSwitch(4); } } class="text-left p-2 px-3 rounded-md md:w-28 w-full text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-indigo-500  fa-solid fa-gear"></i>Settings</button>
                    </div>

                    <div class="w-full h-full bg-zinc-800 border-r border-zinc-700 absolute -left-full md:min-w-[300px] md:max-w-[300px] lg:min-w-[360px] lg:max-w-[360px] md:static md:left-auto" id="PropertyTab">
                
                        <div id="EditorTab" class="w-full h-full">

                            <Prompt args id="Prompt" project={ this.args.project }></Prompt>
                            <Slide args id="Slide" project={ this.args.project }></Slide>
                            <Project args id="Project" project={ this.args.project }></Project>
                            <Export args id="Export" project={ this.args.project }></Export>
                            <Settings args id="Settings" project={ this.args.project }></Settings>

                        </div>

                        <div class="absolute right-10 top-5 flex space-x-6 md:hidden">
                            <button class="fa-solid fa-bars text-md text-zinc-500 hover:text-blue-600 active:text-blue-700" onclick={ () => { this.Navigate(0); } }></button>
                            <button class="fa-solid fa-arrow-right text-md text-zinc-500 hover:text-blue-600 active:text-blue-700" onclick={ () => { this.Navigate(2); } }></button>
                        </div>
                    
                    </div>

                    <div class="w-full h-full absolute left-0 md:static md:left-auto overflow-hidden" id="ViewportTab">
                        <Viewport args id="Viewport" project={ this.args.project }></Viewport>
                        <div class="absolute left-5 top-7 flex space-x-6 md:hidden z-10">
                            <button class="fa-solid fa-bars text-zinc-500 hover:text-blue-600 active:text-blue-700" onclick={ () => { this.Navigate(0); } }></button>
                            <button class="fa-solid fa-pen-to-square text-zinc-500 hover:text-blue-600 active:text-blue-700" onclick={ () => { this.Navigate(1); } }></button>
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

        try {
            
            const { id: pid } = this.Project;

            // Call the api request and check for the success
            // and response status. The api will load assets
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
            console.error(error);
        };

    }
    Navigate(index = 0) {

        const { NavigationTab, ViewportTab, PropertyTab } = this.element;
        Misc.TabNavigate(index, [NavigationTab, PropertyTab, ViewportTab]);

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
    OnProjectUpdate(event, project) {

        // Called from dispatcher event when the
        // project data is updated
        if(project) {
            this.Project = project;
            this.Load();
        };
        this.LoadAsset.bind(this);

    };
};