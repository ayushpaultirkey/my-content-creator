import "./../../../style/output.css";
import H12 from "@library/h12";
import { getProjectList, setProjectList } from "../../module/project";
import Card from "./dashboard/card";

@Component
export default class Dashboard extends H12.Component {
    constructor() {
        super();
    }
    async init() {

        this.Set("{d.loader}", "hidden");
        this.Set("{d.create.toggle}", "hidden");
        this.showProjects();

    }
    async add() {
        return <>
            <div class="bg-blue-500 border-2 border-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors rounded-lg min-h-28 flex flex-col">
                <button class="fa fa-plus w-full h-full text-2xl text-zinc-900" onclick={ this.showCreateProject } title="Create Project"></button>
            </div>
        </>
    }
    async render() {
        return <>
            <div class="w-full h-full relative">
                <div class="p-10">
                    <div class="w-full h-full flex flex-col space-y-8">
                        <div class="w-full flex flex-col ">
                            <label class="text-2xl font-semibold text-zinc-300">Dashboard</label>
                        </div>
                        <div class="grid sm:grid-cols-[repeat(auto-fill,250px)] grid-cols-[repeat(auto-fill,auto)] gap-4">
                            {p.list}
                        </div>
                    </div>
                    <div id="projectCreate" class="absolute top-0 left-0 w-full h-full bg-zinc-900 text-zinc-800 bg-opacity-90 flex justify-center items-center {d.create.toggle}">
                        <div class="w-full h-full sm:h-auto bg-zinc-300 p-6 space-y-4">
                            <label class="text-xl font-semibold">Create new project</label>
                            <div class="flex flex-col space-y-2">
                                <label class="text-sm font-semibold">Project description</label>
                                <textarea class="resize-none h-20 p-2 text-sm font-semibold bg-zinc-200 border-2 border-zinc-400 rounded-lg placeholder:text-zinc-700 placeholder:text-opacity-70" id="projectCreateBox" placeholder="Describe on what topic you want to create the video..."></textarea>
                                <div class="space-x-2">
                                    <button class="p-2 px-6 text-xs text-zinc-200 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors" onclick={ this.createProject }>Create</button>
                                    <button class="p-2 px-6 text-xs text-zinc-200 font-semibold rounded-md bg-zinc-500 hover:bg-zinc-600 active:bg-zinc-700 transition-colors" onclick={ this.hideCreateProject }>Cancel</button>
                                </div>
                            </div>
                            <div class="flex flex-col space-y-1">
                                <label class="text-sm font-semibold">Examples:</label>
                                <button class="text-xs text-left" onclick={ () => { this.addExampleProject(0); } }>&bull; Can you help me in generate a video content for health and fitness ? The video length is around 1 minute.</button>
                                <button class="text-xs text-left" onclick={ () => { this.addExampleProject(1); } }>&bull; Can you create a content for video on recent space discoveries ?</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-zinc-900 bg-opacity-85 backdrop-blur-sm w-full h-full absolute top-0 left-0 flex flex-col justify-center items-center text-zinc-300 {d.loader}">
                    <i class="fas fa-fan fa-spin text-2xl text-blue-500"></i>
                    <label class="text-sm font-semibold">Creating...</label>
                </div>
            </div>
        </>;
    }

    async showProjects() {

        try {

            this.Set("{p.list}", await this.add());

            const _project = await getProjectList();
            for(var i = 0; i < _project.length; i++) {
                this.Set("++{p.list}", <><Card args project={ _project[i] }></Card></>);
            };

        }
        catch(error) {
            console.error(error);
        };

    }

    async createProject() {

        this.Set("{d.loader}", "");

        try {
            
            const _request = await fetch(`/api/project/create?prompt=hello`);
            const _response = await _request.json();

            if(!_response.success) {
                throw new Error(_response.message);
            };

            await setProjectList({ id: _response.pid })
            await this.showProjects();
            this.hideCreateProject();

        }
        catch(error) {
            console.error(error);
        };

        this.Set("{d.loader}", "hidden");

    }

    showCreateProject() {
        this.Set("{d.create.toggle}", "visible");
    }

    hideCreateProject() {
        this.Set("{d.create.toggle}", "hidden");
    }

    addExampleProject(index = 0) {

        const _example = [
            "Can you help me in generate a video content for health and fitness ? The video length is around 1 minute.",
            "Can you create a content for video on recent space discoveries ?"
        ];

        this.element.projectCreateBox.value = _example[index];

    }
};