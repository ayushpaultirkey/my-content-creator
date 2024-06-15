import { getProjectList } from "../../module/project";
import "./../../../style/output.css";
import H12 from "@library/h12";

@Component
export default class Editor extends H12.Component {
    constructor() {
        super();
        this.slideIndex = 0;
        this.project = null;
    }
    async init() {

        //
        this.project = await getProjectList().then(data => data[0]);

        //
        await this.projectLoad();

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
                    
                    <div class="w-full h-full overflow-hidden" id="projectTPrompt">
                        <div class="w-full h-full p-4 px-5 flex flex-col space-y-3 overflow-auto">

                            <div class="border border-transparent border-b-zinc-700 pb-2">
                                <label class="font-semibold text-zinc-400">Prompt</label>
                            </div>

                            <div class="w-full h-full flex flex-col overflow-hidden">
                                <div class="h-full space-y-2 flex flex-col overflow-auto">
                                    {e.prompt}
                                </div>
                                <div class="bg-zinc-400 flex rounded-lg overflow-hidden">
                                    <textarea type="text" class="text-xs font-semibold bg-transparent placeholder:text-zinc-600 w-full p-3 px-4 resize-none" placeholder="Ask anything..."></textarea>
                                    <button class="text-xs font-semibold bg-transparent p-3 px-4 hover:bg-zinc-500 active:bg-zinc-600" onclick={ this.editorUpdateSlide }>Ask</button>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div class="w-full h-full overflow-hidden hidden" id="projectTSlide">
                        <div class="w-full h-full p-4 px-5 flex flex-col space-y-3 overflow-auto">

                            <div class="border border-transparent border-b-zinc-700 pb-2">
                                <label class="font-semibold text-zinc-400">Slide</label>
                            </div>

                            <div>
                                <label class="text-xs font-semibold text-zinc-400">Content:</label>
                                <textarea class="block w-full h-24 text-xs font-semibold bg-zinc-600 p-2 rounded-md shadow-md resize-none placeholder:text-zinc-600 text-zinc-200" placeholder="Slide's content" id="editorSlideContent"></textarea>
                            </div>

                            <div>
                                <label class="text-xs font-semibold text-zinc-400">Background Color:</label>
                                <input type="color" class="block w-10 h-10 appearance-none border-none bg-transparent" />
                            </div>
                            
                            <div>
                                <label class="text-xs font-semibold text-zinc-400">Images:</label>
                                <div class="grid sm:grid-cols-[repeat(auto-fill,56px)] grid-cols-[repeat(auto-fill,auto)] gap-1">
                                    <div class="bg-zinc-600 w-14 h-14 rounded-md shadow-md" draggable="true"></div>
                                    <div class="bg-zinc-600 w-14 h-14 rounded-md shadow-md" draggable="true"></div>
                                    <div class="bg-zinc-600 w-14 h-14 rounded-md shadow-md" draggable="true"></div>
                                    <div class="bg-zinc-600 w-14 h-14 rounded-md shadow-md" draggable="true"></div>
                                    <div class="bg-zinc-600 w-14 h-14 rounded-md shadow-md" draggable="true"></div>
                                    <div class="bg-zinc-600 w-14 h-14 rounded-md shadow-md" draggable="true"></div>
                                </div>
                            </div>

                            <div class="pt-3">
                                <button class="p-2 px-6 text-xs text-zinc-200 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors">Update</button>
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
                                    <label class="text-xs text-zinc-400">&bull; Can you shorten the content of the 1st slide ?</label>
                                    <label class="text-xs text-zinc-400">&bull; Add a red background color on last slide.</label>
                                    <label class="text-xs text-zinc-400">&bull; Add a new outro slide.</label>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div class="w-full h-full overflow-hidden hidden" id="projectTProject">
                        <div class="w-full h-full p-4 px-5 flex flex-col space-y-3 overflow-auto">

                            <div class="border border-transparent border-b-zinc-700 pb-2">
                                <label class="font-semibold text-zinc-400">Project</label>
                            </div>

                            <div>
                                <label class="text-xs font-semibold text-zinc-400">Images:</label>
                                <div class="grid sm:grid-cols-[repeat(auto-fill,56px)] grid-cols-[repeat(auto-fill,auto)] gap-1">
                                    <div class="bg-zinc-600 w-14 h-14 rounded-md shadow-md" draggable="true"></div>
                                    <div class="bg-zinc-600 w-14 h-14 rounded-md shadow-md" draggable="true"></div>
                                    <div class="bg-zinc-600 w-14 h-14 rounded-md shadow-md" draggable="true"></div>
                                    <div class="bg-zinc-600 w-14 h-14 rounded-md shadow-md" draggable="true"></div>
                                    <div class="bg-zinc-600 w-14 h-14 rounded-md shadow-md" draggable="true"></div>
                                    <div class="bg-zinc-600 w-14 h-14 rounded-md shadow-md" draggable="true"></div>
                                </div>
                            </div>

                            <div>
                                <label class="text-xs font-semibold text-zinc-400">Audio:</label>
                                <input type="file" class="block text-xs font-semibold text-zinc-400" />
                            </div>

                            <div class="pt-3">
                                <button class="p-2 px-6 text-xs text-zinc-200 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors">Update</button>
                            </div>

                            <div>
                                <label class="text-xs font-semibold text-zinc-400">Tips:</label>
                                <div>
                                    <label class="text-xs text-zinc-400">Ask the AI in prompt tab to modify the slide, like reorder slides, change color, content, animation, or create new slides.</label>
                                </div>
                            </div>

                        </div>
                    </div>

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
                <div class="w-full h-full flex flex-col overflow-hidden">
                    <div class="bg-zinc-800 w-full h-full flex justify-center items-center">
                        
                        <div class="bg-zinc-300 h-96 shadow-lg">
                            <video class="w-full h-full" id="editorViewportVideo" controls loop autoplay >
                                <source type="video/mp4" id="editorViewport" />
                            </video>
                        </div>

                    </div>
                    <div class="bg-zinc-800 w-full h-24">
                        
                        <div class="flex flex-row border-t border-zinc-700 h-full p-3 space-x-2 overflow-auto">
                            {e.slide}
                        </div>

                    </div>
                </div>
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
    }

    async projectLoad(id = "306c1dc4-59e5-4b47-af24-1c86a0a40083") {

        const currentProject = this.project;

        this.Set("{e.slide}", "");
        for(var i = 0, len = currentProject.data.slide.length; i < len; i++) {

            let id = currentProject.data.slide[i].id;
            let index = i;

            this.Set("{e.slide}++", 
                <>
                    <div class="bg-zinc-900 w-20 h-full rounded-md shadow-md" onclick={ () => { this.loadSlide(id, index); } }>
                        <video class="w-full h-full pointer-events-none" loop autoplay>
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

        this.loadSlide(currentProject.data.slide[0].id, 0);

    }

    async editorUpdateSlide() {

        try {
            
            const request = await fetch(`/api/project/update?id=${this.project.id}&slideid=${this.project.data.slide[0].id}&content=hello`);
            const response = await request.json();

            if(!response.success) {
                throw new Error(response.message);
            };

            console.log(response);

        }
        catch(error) {
            console.error(error);
        };

    }

};