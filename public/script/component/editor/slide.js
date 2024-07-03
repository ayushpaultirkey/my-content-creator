import "@style/main.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
import Asset from "@component/asset";

@Component
export default class Slide extends H12 {

    constructor() {
        super();
        this.Index = 0;
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
            Dispatcher.On("OnViewportSlideSelected", this.OnViewportSlideSelected.bind(this));
            
        };

    }

    async render() {
        
        return <>
            <div class="w-full h-full overflow-hidden hidden">
                <div class="w-full h-full p-4 px-5 flex flex-col space-y-3 overflow-auto">

                    <div class="border border-transparent border-b-zinc-700 pb-2">
                        <label class="font-semibold text-zinc-400">Slide</label>
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-zinc-400">Content:</label>
                        <textarea class="block w-full h-24 text-xs font-semibold bg-zinc-600 p-2 rounded-md shadow-md resize-none placeholder:text-zinc-600 text-zinc-200" placeholder="Slide's content" id="SlideContent"></textarea>
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-zinc-400">Images:</label>
                        <Asset args id="ImageAsset" projectid={ this.args.project.id }></Asset>
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-zinc-400">Videos:</label>
                        <Asset args id="VideoAsset" projectid={ this.args.project.id }></Asset>
                    </div>

                    <div class="border border-transparent border-t-zinc-700 pt-3">
                        <button class="p-2 px-6 text-xs text-blue-100 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors" onclick={ this.Update }><i class="fa-solid fa-splotch mr-2 pointer-events-none"></i>Update</button>
                    </div>
                    
                    <div class="border border-transparent border-t-zinc-700 pt-3">
                        <label class="text-xs font-semibold text-zinc-400 block mb-1">External Asset: <i class="fa-regular fa-circle-question" title="Require to login into google account"></i></label>
                        <button class="p-2 px-6 text-xs text-blue-100 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors" onclick={ () => { this.parent.OpenDriveViewer() } }><i class="fa-brands fa-google-drive mr-2 pointer-events-none"></i>Google Drive</button>
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-zinc-400">Tips:</label>
                        <div class="flex flex-col">
                            <label class="text-xs text-zinc-400">Ask the AI in prompt tab to modify the slide, like reorder slides, change color, content, animation, or create new slides.</label>
                        </div>
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-zinc-400">Example:</label>
                        <div class="flex flex-col">
                            <label class="text-xs text-zinc-400 cursor-pointer" onclick={ () => { this.SetExample(0); } }>&bull; Can you shorten the content of the 1st slide ?</label>
                            <label class="text-xs text-zinc-400 cursor-pointer" onclick={ () => { this.SetExample(1); } }>&bull; Add a red background color on last slide.</label>
                            <label class="text-xs text-zinc-400 cursor-pointer" onclick={ () => { this.SetExample(2); } }>&bull; Add a new outro slide.</label>
                        </div>
                    </div>

                </div>
            </div>
        </>;
    }

    async Load() {

        // Check if the project is valid
        if(!this.Project && !this.Project.property.slides[this.Index]) {
            return false;
        };

        // Get working slide
        let { content, image, video } = this.Project.property.slides[this.Index];

        // Set slid'es content
        this.element.SlideContent.value = content;

        // Assign selected assets
        this.child["ImageAsset"].SetSelected(image);
        this.child["VideoAsset"].SetSelected(video);

    }

    async Update() {

        // Call dispather show loader
        Dispatcher.Call("ShowLoader", "AI is updating slide...");

        try {

            // Check if the project is valid
            if(!this.Project) {
                throw new Error("Invalid project");
            };

            // Check if the slide's content is not empty
            const _content = this.element.SlideContent.value;
            if(_content.length < 5) {
                alert("Please enter slide's content");
                throw new Error("Please enter slide's content");
            };

            // Get project id and the slide's id by the index
            const _projectId = this.Project.id;
            const _slideId = this.Project.property.slides[this.Index].id;

            // Get selected images
            const _image = this.child["ImageAsset"].GenerateQueryString("pimage");
            const _video = this.child["VideoAsset"].GenerateQueryString("pvideo");

            // Perform the update request
            const _response = await fetch(`/api/slide/update?pid=${_projectId}&sid=${_slideId}&scontent=${_content}&${_image}&${_video}`);
            const { success, message, data } = await _response.json();

            // Check if the data is updated successfully
            if(!success || !_response.ok) {
                alert(message);
                throw new Error(message);
            };

            // Update project data
            Dispatcher.Call("OnProjectUpdated", data);

        }
        catch(error) {
            console.error("E/S.Update():", error);
        };

        // Call dispather hide loader
        Dispatcher.Call("HideLoader");

    }

    SetExample(index = 0) {

        const _example = [
            "Can you shorten the content of the 1st slide ?",
            "Add a red background color on last slide.",
            "Add a new outro slide."
        ];

        // Try and set the example text
        try {
            this.element.SlideContent.value = _example[index];
        }
        catch(error) {
            console.error("E/S.SetExample():", error);
        };

    }

    async OnAssetLoaded(event, asset) {
        
        // Check if the project is valid
        if(!this.Project) {
            return false;
        };

        // Get working slide
        let { image, video } = this.Project.property.slides[this.Index];

        // Update the assets collection
        await this.child["ImageAsset"].Load(asset);
        await this.child["VideoAsset"].Load(asset, "video");

        // Assign selected assets
        this.child["ImageAsset"].SetSelected(image);
        this.child["VideoAsset"].SetSelected(video);

    }

    OnViewportSlideSelected(event, { id, index }) {

        this.Index = index;
        this.Load();

    }

    OnProjectUpdated(event, project) {

        if(project) {
            this.Project = project;
            this.Load();
        };

    }

};