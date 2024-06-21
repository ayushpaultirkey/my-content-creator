import "@style/output.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
import { ProjectIsValid } from "../../../module/project";

@Component
export default class Viewport extends H12.Component {
    constructor() {
        super();
        this.Project = null;
        this.SlideIndex = 0;
    }
    async init(args = { project }) {

        // Check if the project is valid and load it
        if(ProjectIsValid(args.project)) {
            this.Project = args.project;
            this.Load();
        };

    }
    async render() {
        return <>
            <div class="w-full h-full flex flex-col overflow-hidden">
                <div class="bg-zinc-800 w-full h-full flex justify-center items-center">
                    
                    <div class="bg-zinc-300 h-96 shadow-lg">
                        <video class="w-full h-full" id="viewportVideo" controls loop autoplay>
                            <source type="video/mp4" id="viewport" />
                        </video>
                    </div>

                </div>
                <div class="bg-zinc-800 w-full h-24 relative">
                    
                    <div class="flex flex-row border-t border-zinc-700 h-full p-3 space-x-2 overflow-auto" id="viewportSlide">
                        {e.slide}
                    </div>

                </div>
            </div>
        </>;
    }

    Load() {

        // Check if the project is valid
        if(!ProjectIsValid(this.Project)) {
            return false;
        };

        // Try and render the viewport
        try {

            // Clear the default slides
            this.Set("{e.slide}", "");

            // Get message array from the project
            const _slides = this.Project.property.slides;

            // Render all slides and assign event
            for(var i = 0, l = _slides.length; i < l; i++) {
    
                let _id = _slides[i].id;
                let _index = i;
    
                this.Set("{e.slide}++",
                    <>
                        <div class="bg-zinc-900 w-20 min-w-20 h-full rounded-md shadow-md" onclick={ () => { this.SlideSelected(_id, _index); } }>
                            <video class="w-full h-full pointer-events-none" oncanplay="this.muted=true;" loop autoplay muted>
                                <source type="video/mp4" src={ `./project/${this.Project.id}/cache/${_id}.mp4` }/>
                            </video>
                        </div>
                    </>
                );
    
            };

            // Load the 1st slide
            this.element.viewport.src = `./project/${this.Project.id}/cache/${_slides[0].id}.mp4`;
            this.element.viewportVideo.load();

        }
        catch(error) {
            console.error(error);
        };

    }

    SlideSelected(id, index) {

        // Check if the project is valid
        if(!ProjectIsValid(this.Project)) {
            return false;
        };

        // Get message array from the project
        const _slide = this.Project.property.slides[index];

        // Set 
        this.element.viewport.src = `./project/${this.Project.id}/cache/${_slide.id}.mp4`;
        this.element.viewportVideo.load();

        // Call dispatcher event
        Dispatcher.Call("OnViewportSlideSelected", { id: id, index: index });

    }

};