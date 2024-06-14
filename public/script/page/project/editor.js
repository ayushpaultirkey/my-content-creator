import { getProjectList } from "../../module/project";
import "./../../../style/output.css";
import H12 from "@library/h12";

@Component
export default class Editor extends H12.Component {
    constructor() {
        super();
    }
    async init() {

        await this.projectLoad();

    }
    async render() {
        return <>
            <div class="h-full flex flex-row">
                <div class="bg-zinc-900 flex-col sm:flex hidden p-2">
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
                                    <div>
                                        <div class="w-2/3 bg-zinc-500 text-xs font-semibold p-2 rounded-md rounded-bl-none shadow-md">
                                            <label>Response</label>
                                        </div>
                                    </div>
                                    <div class="flex justify-end">
                                        <div class="w-2/3 bg-zinc-600 text-xs font-semibold p-2 rounded-md rounded-br-none shadow-md">
                                            <label>Response</label>
                                        </div>
                                    </div>

                                </div>
                                <div class="bg-zinc-400 flex rounded-lg overflow-hidden">
                                    <textarea type="text" class="text-xs font-semibold bg-transparent placeholder:text-zinc-600 w-full p-3 px-4 resize-none" placeholder="Ask anything..."></textarea>
                                    <button class="text-xs font-semibold bg-transparent p-3 px-4 hover:bg-zinc-500 active:bg-zinc-600">Ask</button>
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
                                <textarea class="block w-full h-24 text-xs font-semibold bg-zinc-600 p-2 rounded-md shadow-md resize-none placeholder:text-zinc-600 text-zinc-200" placeholder="Slide's content"></textarea>
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
                                <div>
                                    <label class="text-xs text-zinc-400">Ask the AI in prompt tab to modify the slide, like reorder slides, change color, content, animation, or create new slides.</label>
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
                        
                        <div class="bg-zinc-300 w-60 h-96 shadow-lg"></div>

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


    async projectLoad(id = "306c1dc4-59e5-4b47-af24-1c86a0a40083") {

        const project = await getProjectList().then(data => data[0]);

        this.Set("{e.slide}", "");
        for(var i = 0, len = project.data.slide.length; i < len; i++) {
            this.Set("{e.slide}++", <><div class="bg-zinc-600 w-14 min-w-14 h-full rounded-md shadow-md" draggable="true"></div></>);
        };

        this.Set("{e.prompt}", "");
        for(var i = 0, len = project.prompt.length; i < len; i++) {

            const isUser = (project.prompt[i].sender == "user");
            const chat = <>
                <div class={ (isUser) ? "flex justify-end" : "" }>
                    <div class={ `w-2/3 bg-zinc-500 text-xs font-semibold p-2 rounded-md rounded-${(isUser) ? "br" : "bl"}-none shadow-md` }>
                        <label>{ ~project.prompt[i].content }</label>
                    </div>
                </div>
            </>;

            this.Set("{e.prompt}++", chat);

        };

    }

};