import "@style/main.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
import MyCreator from "@library/mycreator";
import Asset from "@component/asset";
import ServerEvent from "@library/serverevent";

@Component
export default class Project extends H12 {

    constructor() {
        super();
        this.Project = null;
        this.ImageOrder = [];
    }

    async init(args = { project }) {

        // Check if the project is valid and load it
        if(MyCreator.Project.IsValid(args.project)) {

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
                        <label class="text-xs font-semibold text-zinc-400">Title:</label>
                        <input type="text" class="block w-full text-xs font-semibold bg-zinc-600 p-2 rounded-md shadow-md resize-none placeholder:text-zinc-600 text-zinc-300" placeholder="Project's description" id="ProjectTitle" />
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-zinc-400">Description:</label>
                        <textarea class="block w-full h-28 text-xs font-semibold bg-zinc-600 p-2 rounded-md shadow-md resize-none placeholder:text-zinc-600 text-zinc-300" placeholder="Project's description" id="ProjectDescription"></textarea>
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-zinc-400">Backgound Images:</label>
                        <Asset args id="ImageAsset" type="image"></Asset>
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-zinc-400">Backgound Video:</label>
                        <Asset args id="VideoAsset" type="video"></Asset>
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-zinc-400">Backgound Audio:</label>
                        <Asset args id="AudioAsset" type="audio"></Asset>
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-zinc-400 block mb-1">External Asset:</label>
                        <button class="p-2 px-6 text-xs text-blue-100 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors"><i class="fa-brands fa-google-drive mr-2 pointer-events-none"></i>Google Drive</button>
                    </div>

                    <div class="border border-transparent border-t-zinc-700 pt-3">
                        <button class="p-2 px-6 text-xs text-blue-100 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors" onclick={ this.Update }>Update</button>
                    </div>

                    <div class="border border-transparent border-t-zinc-700 pt-3">
                        <label class="text-xs font-semibold text-zinc-400 block mb-1">Render Project:</label>
                        <button class="p-2 px-6 text-xs text-blue-100 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors" onclick={ this.Render } id="ProjectRender">Render</button>
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
        if(!MyCreator.Project.IsValid(this.Project)) {
            return false;
        };

        // Get project's property
        const _property = this.Project.property;

        // Set project's detail
        this.element.ProjectTitle.value = _property.title;
        this.element.ProjectDescription.value = _property.description;

        // Assign selected assets
        this.child["ImageAsset"].SetSelected(_property.backgroundImage);
        this.child["VideoAsset"].SetSelected(_property.backgroundVideo);
        this.child["AudioAsset"].SetSelected(_property.backgroundAudio);

    }

    async Update() {

        // Check if the project is valid
        if(!MyCreator.Project.IsValid(this.Project)) {
            return false;
        };

        // Call dispather show loader
        Dispatcher.Call("ShowLoader", "AI is updating slide...");

        try {

            // Get project detail
            const _projectId = this.Project.id;
            const _projectTitle = this.element.ProjectTitle.value;
            const _projectDetail = this.element.ProjectDescription.value;

            // Check for data
            if(!_projectTitle || !_projectDetail) {
                throw new Error("Please enter project's title and description");
            };

            // Get selected images, videos and audio
            const _image = this.child["ImageAsset"].GenerateQueryString("pimage");
            const _video = this.child["VideoAsset"].GenerateQueryString("pvideo");
            const _audio = this.child["AudioAsset"].GenerateQueryString("paudio");

            // Perform the update request
            const _request = await fetch(`/api/project/update?pid=${_projectId}&${_image}&${_video}&${_audio}&ptitle=${_projectTitle}&pdetail=${_projectDetail}`);
            const _response = await _request.json();

            // Check if the data is updated successfully
            if(!_response.success) {
                alert(_response.message);
                throw new Error(_response.message);
            };

            // Call dispatcher
            Dispatcher.Call("OnProjectUpdated", _response.data);

        }
        catch(error) {
            console.error("/page/editor/project.Update();", error);
        };

        // Call dispather hide loader
        Dispatcher.Call("HideLoader");

    }

    async Render() {

        // Check if the project is valid
        if(!MyCreator.Project.IsValid(this.Project)) {
            alert("Invalid project, try reloading");
            return false;
        };

        // Try and render project
        try {

            // Disable button
            this.element.ProjectRender.disabled = true;

            // Register new server side event and bind
            ServerEvent.Register("Render", `/api/project/render?pid=${this.Project.id}`);

            // Bind new on open event
            ServerEvent.Bind("Render", "open", (event) => {

                // Call dispather show loader
                Dispatcher.Call("OnLoaderShow");

            });

            // Bind new on message event
            ServerEvent.Bind("Render", "message", (event) => {

                // Try and get response
                try {

                    // Get check if its success
                    const _data = JSON.parse(event.data.split("data:"));
                    if(!_data.success) {
                        throw new Error(_data.message);
                    };

                    // Call dispather show loader
                    Dispatcher.Call("OnLoaderUpdate", _data.message);

                }
                catch(error) {

                    // Alert and destory server event
                    alert(error);
                    Dispatcher.Call("OnLoaderHide");
                    ServerEvent.Destroy("Render");

                    // Enable button
                    this.element.ProjectRender.disabled = false;

                };

            });
    
            // Bind new on error event
            ServerEvent.Bind("Render", "error", (event) => {

                // Alert and destory server event
                Dispatcher.Call("OnLoaderHide");
                ServerEvent.Destroy("Render");

                // Enable button
                this.element.ProjectRender.disabled = false;

            });

        }
        catch(error) {

            // Alert and log
            alert("Unable to render project, try again later");
            console.error("Editor/Project.Render():", error);
            
        };

    }

    async OnAssetLoaded(event, asset) {
        
        // Check if the project is valid
        if(!MyCreator.Project.IsValid(this.Project)) {
            return false;
        };

        // Load asset data
        await this.child["ImageAsset"].Load(asset);
        await this.child["VideoAsset"].Load(asset, "video");
        await this.child["AudioAsset"].Load(asset, "audio");

    }

    OnProjectUpdated(event, project) {

        // Check if the project is valid and reload it
        if(MyCreator.Project.IsValid(project)) {
            this.Project = project;
            this.Load();
        };

    }

};