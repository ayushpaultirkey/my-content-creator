import "./../../../style/output.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";

import { ProjectIsValid, getProjectList, setProjectList } from "../../module/project";
import Slide from "./editor/slide";
import Prompt from "./editor/prompt";
import Viewport from "./editor/viewport";
import Project from "./editor/project";

@Component
export default class Editor extends H12.Component {
    constructor() {
        super();
        this.project = null;
        this.projectSlideIndex = 0;
        this.isSlidePreviewPlaying = false;
        this.SlideIndex = 0;
    }
    async init(args = { project }) {

        if(ProjectIsValid(args.project)) {
            this.project = args.project;
        }
        else {
            alert("Unable to get project");
        };

    }
    
    async render() {
        return <>
            <div class="h-full flex flex-row">
                <div class="bg-zinc-900 flex-col sm:flex hidden p-4">
                    <button class="text-left p-2 px-3 rounded-md w-36 text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-blue-500 fa fa-grip"></i>Dashboard</button>
                    <button onclick={ () => { this.tab(0); } } class="text-left p-2 px-3 rounded-md w-36 text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-red-500 fa-solid fa-wand-magic-sparkles"></i>Prompt</button>
                    <button onclick={ () => { this.tab(1); } } class="text-left p-2 px-3 rounded-md w-36 text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-green-500 fa-solid fa-film"></i>Slide</button>
                    <button onclick={ () => { this.tab(2); } } class="text-left p-2 px-3 rounded-md w-36 text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-yellow-500 fa-solid fa-folder-open"></i>Project</button>
                    <button onclick={ () => { this.tab(3); } } class="text-left p-2 px-3 rounded-md w-36 text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-cyan-500 fa-solid fa-download"></i>Export</button>
                    <button onclick={ () => { this.tab(4); } } class="text-left p-2 px-3 rounded-md w-36 text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-indigo-500  fa-solid fa-gear"></i>Settings</button>
                </div>
                <div class="min-w-80 max-w-80 bg-zinc-800 border-r border-zinc-700 flex-col sm:flex hidden" id="projectTab">
                    
                    <Prompt args id="Prompt" project={ this.args.project }></Prompt>
                    <Slide args id="Slide" project={ this.args.project }></Slide>
                    <Project args id="Project" project={ this.args.project }></Project>

                    <div class="w-full h-full overflow-hidden hidden" id="projectTExport">
                        <div class="w-full h-full p-4 px-5 flex flex-col space-y-3 overflow-auto">

                            <div class="border border-transparent border-b-zinc-700 pb-2">
                                <label class="font-semibold text-zinc-400">Export</label>
                            </div>

                            <div class="pt-3">
                                <button class="p-2 px-6 text-xs text-zinc-200 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors">Export Video</button>
                            </div>

                        </div>
                    </div>

                    <div class="w-full h-full overflow-hidden hidden" id="projectTSetting">
                        <div class="w-full h-full p-4 px-5 flex flex-col space-y-3 overflow-auto">

                            <div class="border border-transparent border-b-zinc-700 pb-2">
                                <label class="font-semibold text-zinc-400">Settings</label>
                            </div>

                            <div class="pt-3">
                                <button class="p-2 px-6 text-xs text-zinc-200 font-semibold rounded-md bg-red-500 hover:bg-red-600 active:bg-red-700 transition-colors">Delete Project</button>
                            </div>

                            <div>
                                <label class="text-xs font-semibold text-zinc-400">Note:</label>
                                <div>
                                    <label class="text-xs text-zinc-400">The deleted project cannot be recovered !</label>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>

                <Viewport args id="Viewport" project={ this.args.project }></Viewport>

            </div>
        </>;
    }

    tab(index = 0) {

        const _children = Array.from(this.element.projectTab.children);

        if(index >= 0 && index < _children.length) {
            _children.forEach(x => {
                x.classList.add("hidden");
            });
            _children[index].classList.remove("hidden");
        };

    }

    loadSlide(id, index) {
        this.element.editorViewport.src = `./project/${this.project.id}/cache/${id}.mp4`;
        this.element.editorViewportVideo.load();
        this.element.editorSlideContent.value = this.project.data.slide[index].content;
        this.projectSlideIndex = index;
    }

    async projectReload() {
        await this.projectLoad(null, this.projectSlideIndex);
    }

    editorSlideRefresh() {

        try {

            this.element.editorViewportVideo.load();

            this.element.editorSlides.querySelectorAll("video").forEach(x => {
                (this.isSlidePreviewPlaying) ? x.pause() : x.load();
            });
            this.isSlidePreviewPlaying = !this.isSlidePreviewPlaying;

            this.Set("{e.slidePlay}", (this.isSlidePreviewPlaying) ? "pause" : "play");


        }
        catch(error) {
            console.error(error);
        }

    }

    async projectLoad(id = "306c1dc4-59e5-4b47-af24-1c86a0a40083", slideIndex = 0) {

        //
        const currentProject = await getProjectList().then(data => data[0]);

        this.project = currentProject;

        this.Set("{e.slide}", "");
        for(var i = 0, len = currentProject.data.slide.length; i < len; i++) {

            let id = currentProject.data.slide[i].id;
            let index = i;

            this.Set("{e.slide}++",
                <>
                    <div class="bg-zinc-900 w-20 min-w-20 h-full rounded-md shadow-md" id="num" onclick={ () => { this.loadSlide(id, index); } }>
                        <video class="w-full h-full pointer-events-none" loop autoplay muted>
                            <source type="video/mp4" src={ `./project/${currentProject.id}/cache/${currentProject.data.slide[i].id}.mp4` }/>
                        </video>
                    </div>
                </>
            );

        };

        this.Set("{e.prompt}", "");
        for(var i = 0, len = currentProject.prompt.length; i < len; i++) {

            const isUser = (currentProject.prompt[i].sender == "user");
            const chat = <>
                <div class={ (isUser) ? "flex justify-end" : "" }>
                    <div class={ `w-2/3 bg-zinc-500 text-xs font-semibold p-2 rounded-md rounded-${(isUser) ? "br" : "bl"}-none shadow-md` }>
                        <label>{ ~currentProject.prompt[i].content }</label>
                    </div>
                </div>
            </>;

            this.Set("{e.prompt}++", chat);

        };

        this.loadSlide(currentProject.data.slide[slideIndex].id, slideIndex);

    }

    async editorUpdateSlide() {

        Dispatcher.Call("ShowLoader", "AI is updating slide...");

        try {

            const slideContent = this.element.editorSlideContent.value;
            
            const request = await fetch(`/api/slide/update?pid=${this.project.id}&sid=${this.project.data.slide[this.projectSlideIndex].id}&scontent=${slideContent}`);
            const response = await request.json();

            if(!response.success) {
                throw new Error(response.message);
            };

            await this.projectReload();

        }
        catch(error) {
            console.error(error);
        };

        Dispatcher.Call("HideLoader");

    }

};