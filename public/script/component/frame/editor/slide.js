import "@style/main.css";
import H12 from "@library/h12";
import Config from "@library/config";
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

            this.Project = args.project;
            this.Load();

            // Register the dispatcher event
            // The dispacther event when the project and asset are udapted
            // and the slide is selected
            Dispatcher.On(Config.ON_FASSET_LOAD, this.OnAssetLoad.bind(this));
            Dispatcher.On(Config.ON_FSLIDE_SELECT, this.OnSlideSelect.bind(this));
            Dispatcher.On(Config.ON_FPROJECT_UPDATE, this.OnProjectUpdate.bind(this));
            
        };

    }
    async render() {

        // Check if the project is valid
        const { project } = this.args;
        if(!project) {
            return <><label>Invalid project</label></>;
        };
        
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
                        <Asset args id="ImageAsset" projectid={ project.id }></Asset>
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-zinc-400">Videos:</label>
                        <Asset args id="VideoAsset" projectid={ project.id }></Asset>
                    </div>

                    <div class="border border-transparent border-t-zinc-700 pt-3">
                        <button class="p-2 px-6 text-xs text-blue-100 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors" onclick={ this.Update }><i class="fa-solid fa-splotch mr-2 pointer-events-none"></i>Update</button>
                    </div>
                    
                    <div class="border border-transparent border-t-zinc-700 pt-3">
                        <label class="text-xs font-semibold text-zinc-400 block mb-1">External Asset: <i class="fa-regular fa-circle-question" title="Require to login into google account"></i></label>
                        <button class="p-2 px-6 text-xs text-blue-100 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors" onclick={ () => { this.parent.OpenGDriveViewer() } }><i class="fa-brands fa-google-drive mr-2 pointer-events-none"></i>Google Drive</button>
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

        const { Project, element, child } = this;
        const { ImageAsset, VideoAsset } = child;
        const { SlideContent } = element;

        // Check if the project is valid
        // along with the slide
        if(!Project || !Project.property.slides[this.Index] || !ImageAsset || !VideoAsset) {
            return false;
        };

        // Get slide's data from the project
        // using the slide id
        let { content, image, video } = Project.property.slides[this.Index];

        // Set slid'es content
        SlideContent.value = content;

        // Assign selected assets
        ImageAsset.SetSelected(image);
        VideoAsset.SetSelected(video);

    }
    async Update() {

        // Call dispather show loader
        Dispatcher.Call(Config.ON_LOADER_SHOW);
        Dispatcher.Call(Config.ON_LOADER_UPDATE, "AI is updating slide...");

        try {

            const { Project, element, child } = this;
            const { ImageAsset, VideoAsset } = child;
            const { SlideContent } = element;

            // Check if the project is valid
            if(!Project || !ImageAsset || !VideoAsset) {
                throw new Error("Invalid project");
            };

            // Check if the slide's content is not empty
            const _content = SlideContent.value;
            if(_content.length < 5) {
                throw new Error("Please enter slide's content");
            };

            // Get project id and the slide's id by the index
            const { id, property: { slides } } = Project;
            const _slideId = slides[this.Index].id;

            // Get selected images
            const _image = ImageAsset.GenerateQueryString("pimage");
            const _video = VideoAsset.GenerateQueryString("pvideo");

            // Call the api request and check for the success
            // and response status. The api will update the slide
            // data and respond with new project data
            const _response = await fetch(`/api/frame/slide/update?pid=${id}&sid=${_slideId}&scontent=${_content}&${_image}&${_video}`);
            const { success, message, data } = await _response.json();

            if(!success || !_response.ok) {
                throw new Error(message);
            };

            // Call dispacther event to update data
            Dispatcher.Call(Config.ON_FPROJECT_UPDATE, data);

        }
        catch(error) {
            alert(error);
            console.error(error);
        };

        // Call dispather hide loader
        Dispatcher.Call(Config.ON_LOADER_HIDE);

    }
    SetExample(index = 0) {

        const _example = [
            "Can you shorten the content of the 1st slide ?",
            "Add a red background color on last slide.",
            "Add a new outro slide."
        ];

        try {
            this.element.SlideContent.value = _example[index];
        }
        catch(error) {
            console.error(error);
        };

    }
    async OnAssetLoad(event, asset) {
        
        // Called from dispatcher event when tge
        // asset is loaded
        const { Project, child } = this;
        const { ImageAsset, VideoAsset } = child;
        const { property: { slides } } = Project;

        if(!Project || !ImageAsset || !VideoAsset) {
            return false;
        };

        // Get working slide
        let { image, video } = slides[this.Index];

        // Update the assets collection
        await ImageAsset.Load(asset);
        await VideoAsset.Load(asset, "video");

        // Assign selected assets
        ImageAsset.SetSelected(image);
        VideoAsset.SetSelected(video);

    }
    OnSlideSelect(event, { index }) {

        // Called from dispatcher event when the
        // slide is selected
        this.Index = index;
        this.Load();

    }
    OnProjectUpdate(event, project) {

        // Called from dispatcher event when the
        // project data is updated
        if(project) {
            this.Project = project;
            this.Load();
        };

    }
};