import "@style/main.css";
import H12 from "@library/h12";
import Misc from "@library/misc";
import Config from "@library/config";
import Dispatcher from "@library/h12.dispatcher";

import Authenticate from "@component/google/authenticate";

@Component
export default class Viewport extends H12 {
    constructor() {
        super();
        this.Project = null;
        this.SlideIndex = 0;
    }
    async init(args = { project }) {

        // Check if the project is valid and load it
        if(args.project) {

            this.Project = args.project;
            this.Load();

            // Register the dispatcher event
            // The dispacther event when the project is udapted
            Dispatcher.On(Config.ON_FPROJECT_UPDATE, this.OnProjectUpdated.bind(this));

        };

    }
    async render() {
        return <>
            <div class="w-full h-full flex flex-col overflow-hidden">
                <div class="bg-zinc-800 w-full h-full flex justify-center items-center relative">
                    
                    <Authenticate args style="absolute md:top-10 md:right-10 right-5 top-5 z-10"></Authenticate>

                    <div class="bg-zinc-300 h-96 shadow-lg">
                        <video class="w-full h-full" id="ViewportVideo" controls loop autoplay>
                            <source type="video/mp4" id="Viewport" />
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

        try {

            // Check if the project is valid
            if(!this.Project) {
                throw new Error("Invalid project")
            };

            // Get all the slides from the project
            const { id, property: { slides } } = this.Project;

            // Clear the previous slides
            this.Set("{e.slide}", "");

            // Render all slides and assign event
            for(var i = 0, l = slides.length; i < l; i++) {
    
                let _sid = slides[i].id;
                let _index = i;
    
                this.Set("{e.slide}++",
                    <>
                        <div class="bg-zinc-900 w-20 min-w-20 h-full rounded-md shadow-md" onclick={ () => { this.SlideSelected(_index); } }>
                            <video class="w-full h-full pointer-events-none" oncanplay="this.muted=true;" loop autoplay muted>
                                <source type="video/mp4" src={ `./project/${id}/cache/${_sid}.mp4` }/>
                            </video>
                        </div>
                    </>
                );
    
            };

            // Update the current viewport video
            // and load it
            const { Viewport, ViewportVideo } = this.element;
            Viewport.src = `./project/${id}/cache/${slides[0].id}.mp4?r=${Misc.uuid()}`;
            ViewportVideo.load();

        }
        catch(error) {
            console.error(error);
        };

    }
    SlideSelected(index) {

        const { Project, element } = this;
        const { Viewport, ViewportVideo } = element;

        // Check if the project is valid
        if(!Project) {
            return false;
        };

        // Get the slide and check if the slide exists
        const { id, property: { slides } } = Project;
        if(!slides[index]) {
            return false;
        };

        // Load the video
        Viewport.src = `./project/${id}/cache/${slides[index].id}.mp4?r=${Misc.uuid()}`;
        ViewportVideo.load();

        // Call dispatcher to update the selected slide
        Dispatcher.Call(Config.ON_FSLIDE_SELECT, { index: index });

    }
    OnProjectUpdated(event, project) {

        // Called from dispatcher event when the
        // project data is updated
        if(project) {
            this.Project = project;
            this.Load();
        };

    }
};