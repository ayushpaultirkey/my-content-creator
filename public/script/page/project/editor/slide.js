import "./../../../style/output.css";
import Dispatcher from "@library/h12.dispatcher";
import H12 from "@library/h12";

@Component
export default class Slide extends H12.Component {
    constructor() {
        super();
    }
    async init() {

        Dispatcher.On("ProjectLoaded", this.CreateSlide.bind(this));

    }
    async render() {
        return <>
            <div class="bg-zinc-800 w-full h-24 relative">
                <button class="fa fa-{e.slidePlay} top-2 right-1 absolute text-zinc-500" onclick={ this.editorSlideRefresh }></button>
                <div class="flex flex-row border-t border-zinc-700 h-full p-3 space-x-2 overflow-auto" id="editorSlides">
                    {e.slide}
                </div>
            </div>
        </>;
    }

    CreateSlide(project = {}) {


        for(var i = 0, len = project.data.slide.length; i < len; i++) {

            let id = project.data.slide[i].id;
            let index = i;

            this.Set("{e.slide}++",
                <>
                    <div class="bg-zinc-900 w-20 min-w-20 h-full rounded-md shadow-md" id="num" onclick={ () => { this.loadSlide(id, index); } }>
                        <video class="w-full h-full pointer-events-none" loop autoplay muted>
                            <source type="video/mp4" src={ `./project/${project.id}/cache/${project.data.slide[i].id}.mp4` }/>
                        </video>
                    </div>
                </>
            );

        };
        
    }

};