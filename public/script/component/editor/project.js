import "@style/main.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
import ServerEvent from "@library/sse";
import Config from "@library/@config";
import Asset from "@component/asset";

@Component
export default class Project extends H12 {

    constructor() {
        super();
        this.Project = null;
    }

    async init(args) {

        // Check if the project is valid and load it
        if(args.project) {

            // Set project and load
            this.Project = args.project;
            this.Load();

            // Register on dispatcher event
            Dispatcher.On(Config.ON_FASSET_LOAD, this.OnAssetLoad.bind(this));
            Dispatcher.On(Config.ON_FPROJECT_UPDATE, this.OnProjectUpdate.bind(this));

        };

    }

    async render() {
        return <>
            <div class="w-full h-full overflow-hidden hidden">
                <div class="w-full h-full p-4 px-5 flex flex-col space-y-3 overflow-auto">

                    <div class="border border-transparent border-b-zinc-700 pb-2">
                        <label class="font-semibold text-zinc-400">Project</label>
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-zinc-400">Title: <i class="fa-regular fa-circle-question" title="Title for video if exported to youtube"></i></label>
                        <input type="text" class="block w-full text-xs font-semibold bg-zinc-600 p-2 rounded-md shadow-md resize-none placeholder:text-zinc-600 text-zinc-300" placeholder="Project's description" id="ProjectTitle" />
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-zinc-400">Description: <i class="fa-regular fa-circle-question" title="Description for video if exported to youtube"></i></label>
                        <textarea class="block w-full h-28 text-xs font-semibold bg-zinc-600 p-2 rounded-md shadow-md resize-none placeholder:text-zinc-600 text-zinc-300" placeholder="Project's description" id="ProjectDescription"></textarea>
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-zinc-400">Backgound Audio:</label>
                        <Asset args id="AudioAsset" type="audio"></Asset>
                    </div>

                    <div class="border border-transparent border-t-zinc-700 pt-3">
                        <button class="p-2 px-6 text-xs text-blue-100 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors" onclick={ this.Update }>Update</button>
                    </div>

                    <div class="border border-transparent border-t-zinc-700 pt-3">
                        <label class="text-xs font-semibold text-zinc-400 block mb-1">External Asset: <i class="fa-regular fa-circle-question" title="Require to login into google account"></i></label>
                        <button class="p-2 px-6 text-xs text-blue-100 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors" onclick={ () => { this.parent.OpenGDriveViewer() } }><i class="fa-brands fa-google-drive mr-2 pointer-events-none"></i>Google Drive</button>
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-zinc-400 block mb-1">Render Project:</label>
                        <button class="p-2 px-6 text-xs text-blue-100 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors" onclick={ this.Render } id="PRender">Render</button>
                    </div>

                    <div class="flex flex-col">
                        <label class="text-xs font-semibold text-zinc-400">Tips:</label>
                        <label class="text-xs text-zinc-400">Ask the AI in prompt tab to modify the slide, like reorder slides, change color, content, animation, or create new slides.</label>
                    </div>

                </div>
            </div>
        </>;
    }
    
    async Load() {

        const { Project, element, child } = this;

        // Check if the project is valid
        if(!Project || !Project.property) {
            return false;
        };

        //
        const { AudioAsset } = child;
        const { ProjectTitle, ProjectDescription } = element;
        const { title, description, backgroundAudio } = Project.property;

        // Set project's detail
        ProjectTitle.value = title;
        ProjectDescription.value = description;

        // Assign selected assets
        AudioAsset.SetSelected(backgroundAudio);
        
    }

    async Update() {
        
        Dispatcher.Call(Config.ON_LOADER_SHOW);
        Dispatcher.Call(Config.ON_LOADER_UPDATE, "AI is updating slide...");

        try {

            //
            const { Project, element, child } = this;
            const { ProjectTitle, ProjectDescription } = element;
            const { AudioAsset } = child;

            //
            if(!Project) {
                throw new Error("Invalid project");
            };

            //
            const _title = ProjectTitle.value;
            const _detail = ProjectDescription.value;
            const _audio = AudioAsset.GenerateQueryString("paudio");

            //
            if(!_title || !_detail) {
                throw new Error("Please enter title and description");
            };

            //
            const _response = await fetch(`/api/frame/project/update?pid=${Project.id}&${_audio}&ptitle=${_title}&pdetail=${_detail}`);
            const { success, message, data } = await _response.json();

            //
            if(!success || !_response.ok) {
                throw new Error(message);
            };

            //
            Dispatcher.Call(Config.ON_FPROJECT_UPDATE, data);

        }
        catch(error) {
            alert(error);
            console.error("E/P.Update();", error);
        };

        //
        Dispatcher.Call(Config.ON_LOADER_HIDE);

    }

    async Render() {


        const { Project, element } = this;
        const { PRender } = element;

        //
        try {

            //
            if(!Project) {
                throw new Error("Invalid project, try reloading");
            };

            //
            PRender.disabled = true;

            //
            ServerEvent(`/api/frame/project/render?pid=${Project.id}`, {
                onOpen: () => {
                    
                    Dispatcher.Call(Config.ON_LOADER_SHOW);

                },
                onMessage: (data) => {

                    Dispatcher.Call(Config.ON_LOADER_UPDATE, data.message);

                },
                onFinish: () => {

                    alert("Render finished");
                    Dispatcher.Call(Config.ON_FRENDER_UPDATE);
                    PRender.disabled = false;

                },
                onError: (status, message) => {

                    if(status !== EventSource.CLOSED && message) {
                        alert(message);
                    };
                    Dispatcher.Call(Config.ON_LOADER_HIDE);
                    PRender.disabled = false;

                }
            });

        }
        catch(error) {

            //
            PRender.disabled = false;
            alert("Unable to render project");
            console.error("E/P.Render():", error);
            
        };

    }

    async OnAssetLoad(event, asset) {
        
        //
        if(!this.Project) {
            return false;
        };

        //
        const { AudioAsset } = this.child;
        const { backgroundAudio } = this.Project.property;

        //
        AudioAsset.Load(asset, "audio");
        AudioAsset.SetSelected(backgroundAudio);

    }

    OnProjectUpdate(event, project) {

        //
        if(project) {
            this.Project = project;
            this.Load();
        };

    }

};