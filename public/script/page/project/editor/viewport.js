import "@style/main.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
import MyCreator from "@library/mycreator";
import ServerEvent from "@library/serverevent";

@Component
export default class Viewport extends H12 {

    constructor() {
        super();
        this.Project = null;
        this.SlideIndex = 0;
    }

    async init(args = { project }) {

        // Check if the project is valid and load it
        if(MyCreator.Project.IsValid(args.project)) {

            // Set project and load
            this.Project = args.project;
            this.Load();
            this.Auth();

            // Register on dispatcher event
            Dispatcher.On("OnProjectUpdated", this.OnProjectUpdated.bind(this));

        };

    }

    async render() {
        return <>
            <div class="w-full h-full flex flex-col overflow-hidden">
                <div class="bg-zinc-800 w-full h-full flex justify-center items-center relative">
                    
                    <button class="text-xs text-blue-700 font-semibold py-2 w-44 border-2 border-blue-800 bg-blue-950 bg-opacity-40 hover:bg-opacity-70 active:bg-opacity-90 rounded-md {d.auth.visible} absolute top-10 right-10" onclick={ MyCreator.Auth }>
                        <i class="fa-brands fa-google mr-2 pointer-events-none"></i>
                        <label class="pointer-events-none">{d.auth}</label>
                    </button>

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

        // Check if the project is valid
        if(!MyCreator.Project.IsValid(this.Project)) {
            return false;
        };

        // Try and render the Viewport
        try {

            // Clear the default slides
            this.Set("{e.slide}", "");

            // Get slides from the project
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
            this.element.Viewport.src = `./project/${this.Project.id}/cache/${_slides[0].id}.mp4`;
            this.element.ViewportVideo.load();

        }
        catch(error) {
            console.error(error);
        };

    }

    SlideSelected(id, index) {

        // Check if the project is valid
        if(!MyCreator.Project.IsValid(this.Project)) {
            return false;
        };

        // Get message array from the project
        const _slide = this.Project.property.slides[index];

        // Set video url
        this.element.Viewport.src = `./project/${this.Project.id}/cache/${_slide.id}.mp4`;
        this.element.ViewportVideo.load();

        // Call dispatcher event
        Dispatcher.Call("OnViewportSlideSelected", { id: id, index: index });

    }

    Auth() {

        // Check for old messages
        try {
            const _history = ServerEvent.HistoryLast("AuthStatus");
            const _data = JSON.parse(_history);
            this.Set("{d.auth}", ((_data.success) ? "Connected to Google" : "Connect to Google"));
        }
        catch(error) {
            console.error("Editor/Viewport/AuthStatus():", error);
            this.Set("{d.auth}", "Connect to Google");
        };

        // Bind new on message event
        ServerEvent.Bind("AuthStatus", "message", (event) => {
            try {
                const _data = JSON.parse(event.data.split("data:"));
                this.Set("{d.auth}", ((_data.success) ? "Connected to Google" : "Connect to Google"));
            }
            catch(error) {
                console.error("Editor/Viewport/AuthStatus():", error);
                ServerEvent.Destroy("AuthStatus");
                this.Set("{d.auth.visible}", "hidden");
            };
        });

        // Bind new on error event
        ServerEvent.Bind("AuthStatus", "error", () => {
            console.error("Editor/Viewport/AuthStatus(): AuthStatus error");
            ServerEvent.Destroy("AuthStatus");
            this.Set("{d.auth.visible}", "hidden");
        });

    }

    OnProjectUpdated(event, project) {

        // Check if the project is valid and reload it
        if(project) {
            this.Project = project;
            this.Load();
        };

    }
    
};