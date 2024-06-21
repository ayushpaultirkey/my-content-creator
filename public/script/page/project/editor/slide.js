import "@style/output.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
import { ProjectIsValid } from "../../../module/project";
import Asset from "./asset";

@Component
export default class Slide extends H12.Component {
    constructor() {
        super();
        this.Index = 0;
        this.Project = null;
    }
    async init(args = { project }) {

        // Check if the project is valid and load it
        if(ProjectIsValid(args.project)) {

            // Get project data and load it
            this.Project = args.project;
            this.Load();

            // Register on dispatcher event
            Dispatcher.On("OnProjectUpdate", this.OnProjectUpdate.bind(this));
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
                        <textarea class="block w-full h-24 text-xs font-semibold bg-zinc-600 p-2 rounded-md shadow-md resize-none placeholder:text-zinc-600 text-zinc-200" placeholder="Slide's content" id="slideContent"></textarea>
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-zinc-400">Background Color:</label>
                        <input type="color" class="block w-10 h-10 appearance-none border-none bg-transparent" />
                    </div>
                    
                    <div>
                        <label class="text-xs font-semibold text-zinc-400">Images:</label>
                        <Asset args id="ImageAsset"></Asset>
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-zinc-400">Videos:</label>
                        <Asset args id="VideoAsset"></Asset>
                    </div>

                    <div class="pt-3">
                        <button class="p-2 px-6 text-xs text-zinc-200 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors" onclick={ this.Update }>Update</button>
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
        if(!ProjectIsValid(this.Project)) {
            return false;
        };

        // Try and load the slide's content
        try {

            let _slide = this.Project.property.slides[this.Index];

            this.element.slideContent.value = _slide.content;

            const _request = await fetch(`/api/asset/fetch?pid=${this.Project.id}`);
            const _response = await _request.json();

            if(!_response.success) {
                throw new Error(_response.message);
            };
            
            await this.child["ImageAsset"].Load(_response.data);
            this.child["ImageAsset"].SetSelected(_slide.image);

            await this.child["VideoAsset"].Load(_response.data, ["video/mp4"]);
            this.child["VideoAsset"].SetSelected(_slide.image);

        }
        catch(error) {
            console.error(error);
        };

    }

    async Update() {
        
        // Call dispather show loader
        Dispatcher.Call("ShowLoader", "AI is updating slide...");

        try {

            // Check if the slide's content is not empty
            const _slideContent = this.element.slideContent.value;
            if(_slideContent.length < 5) {
                alert("Please enter slide's content");
                throw new Error("Please enter slide's content");
            };

            // Get project id and the slide's id by the index
            const _projectId = this.Project.id;
            const _slideId = this.Project.property.slides[this.Index].id;

            // Get selected images
            const _image = this.child["ImageAsset"].Selected;
            const _imageQuery = _image.map((image, index) => `pimage[]=${encodeURIComponent(image)}`).join('&');

            // Perform the update request
            const _request = await fetch(`/api/slide/update?pid=${_projectId}&sid=${_slideId}&scontent=${_slideContent}&${_imageQuery}`);
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

    SetExample(index = 0) {

        const _example = [
            "Can you shorten the content of the 1st slide ?",
            "Add a red background color on last slide.",
            "Add a new outro slide."
        ];

        // Try and set the example text
        try {
            this.element.slideContent.value = _example[index];
        }
        catch(error) {
            console.error(error);
        };

    }

    OnViewportSlideSelected(event, { id, index }) {

        this.Index = index;
        this.Load(index);

    }

    OnProjectUpdate(event, project) {

        if(ProjectIsValid(project)) {
            this.Project = project;
            this.Load();
        };

    };

};