import "@style/main.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
import MyCreator from "@library/mycreator";
import Asset from "@component/asset";

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
            Dispatcher.On("OnProjectUpdate", this.OnProjectUpdate.bind(this));
            Dispatcher.On("OnAssetLoad", this.OnAssetLoad.bind(this));

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

        this.element.ProjectTitle.value = this.Project.property.title;
        this.element.ProjectDescription.value = this.Project.property.description;

    }

    async OnAssetLoad(event, asset) {
        
        // Check if the project is valid
        if(!MyCreator.Project.IsValid(this.Project)) {
            return false;
        };

        // Update the assets collection
        await this.child["ImageAsset"].Load(asset);
        await this.child["VideoAsset"].Load(asset, "video");

        // Assign selected assets
        this.child["ImageAsset"].SetSelected(this.Project.property.backgroundImage);
        this.child["VideoAsset"].SetSelected(this.Project.property.backgroundVideo);

    };

    async Update() {

        // Check if the project is valid
        if(!MyCreator.Project.IsValid(this.Project)) {
            return false;
        };

        // Call dispather show loader
        Dispatcher.Call("ShowLoader", "AI is updating slide...");

        try {

            // Get project id and the slide's id by the index
            const _projectId = this.Project.id;

            // Get selected images and videos
            const _image = this.child["ImageAsset"].GenerateQueryString("pimage");
            const _video = this.child["VideoAsset"].GenerateQueryString("pvideo");

            // Perform the update request
            const _request = await fetch(`/api/project/update?pid=${_projectId}&${_image}&${_video}`);
            const _response = await _request.json();

            // Check if the data is updated successfully
            if(!_response.success) {
                alert(_response.message);
                throw new Error(_response.message);
            };

            // Update project data
            Dispatcher.Call("OnProjectUpdate", _response.data);

        }
        catch(error) {
            console.error(error);
        };

        // Call dispather hide loader
        Dispatcher.Call("HideLoader");

    }

    OnProjectUpdate(event, project) {

        // Check if the project is valid and reload it
        if(MyCreator.Project.IsValid(project)) {
            this.Project = project;
            this.Load();
        };

    };

};