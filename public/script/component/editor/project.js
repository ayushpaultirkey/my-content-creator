import "@style/main.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
import Asset from "@component/asset";
import ServerEvent from "@library/sse";

@Component
export default class Project extends H12 {

    constructor() {
        super();
        this.Project = null;
    }

    async init(args = { project }) {

        // Check if the project is valid and load it
        if(args.project) {

            // Set project and load
            this.Project = args.project;
            this.Load();
            
            // Register on dispatcher event
            Dispatcher.On("OnAssetLoaded", this.OnAssetLoaded.bind(this));
            Dispatcher.On("OnProjectUpdated", this.OnProjectUpdated.bind(this));

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
                        <button class="p-2 px-6 text-xs text-blue-100 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors"><i class="fa-brands fa-google-drive mr-2 pointer-events-none"></i>Google Drive</button>
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

        // Check if the project is valid
        if(!this.Project || !this.Project.property) {
            return false;
        };

        const { title, description, backgroundAudio } = this.Project.property;
        const { ProjectTitle, ProjectDescription } = this.element;

        // Set project's detail
        ProjectTitle.value = title;
        ProjectDescription.value = description;

        // Assign selected assets
        this.child["AudioAsset"].SetSelected(backgroundAudio);
        
    }

    async Update() {

        // Check if the project is valid
        if(!this.Project) {
            return false;
        };

        // Call dispather show loader
        Dispatcher.Call("ShowLoader", "AI is updating slide...");

        try {

            // Get project detail
            const { id } = this.Project.id;
            const { ProjectTitle, ProjectDescription } = this.element;

            const _title = ProjectTitle.value;
            const _detail = ProjectDescription.value;

            // Check for data
            if(!_title || !_detail) {
                throw new Error("Please enter title and description");
            };

            // Get selected audio
            const _audio = this.child["AudioAsset"].GenerateQueryString("paudio");

            // Perform the update request
            const _response = await fetch(`/api/project/update?pid=${id}&${_audio}&ptitle=${_title}&pdetail=${_detail}`);
            const { success, message, data } = await _response.json();

            // Check if the data is updated successfully
            if(!success || !_response.ok) {
                alert(message);
                throw new Error(message);
            };

            // Call dispatcher
            Dispatcher.Call("OnProjectUpdated", data);

        }
        catch(error) {
            console.error("E/P.Update();", error);
        };

        // Call dispather hide loader
        Dispatcher.Call("HideLoader");

    }

    async Render() {

        // Check if the project is valid
        if(!this.Project) {
            alert("Invalid project, try reloading");
            return false;
        };

        try {

            // Disable button
            const { PRender } = this.element;
            PRender.disabled = true;

            ServerEvent(`/api/project/render?pid=${this.Project.id}`, {
                onOpen: () => {
                    
                    Dispatcher.Call("OnLoaderShow");

                },
                onMessage: (data) => {

                    Dispatcher.Call("OnLoaderUpdate", data.message);

                },
                onFinish: () => {

                    alert("Render finished");
                    Dispatcher.Call("OnLoaderHide");
                    PRender.disabled = false;

                },
                onError: (status, message) => {

                    if(status !== EventSource.CLOSED && message) {
                        alert(message);
                    };
                    Dispatcher.Call("OnLoaderHide");
                    PRender.disabled = false;

                }
            });

        }
        catch(error) {

            // Alert and log
            alert("Unable to render project");
            console.error("E/P.Render():", error);
            
        };

    }

    async OnAssetLoaded(event, asset) {
        
        // Check if the project is valid
        if(!this.Project) {
            return false;
        };

        // Get project's property
        const { backgroundAudio } = this.Project.property;
        const { AudioAsset } = this.child;

        // Load asset data
        AudioAsset.Load(asset, "audio");
        AudioAsset.SetSelected(backgroundAudio);

    }

    OnProjectUpdated(event, project) {

        // Check if the project is valid and reload it
        if(project) {
            this.Project = project;
            this.Load();
        };

    }

};