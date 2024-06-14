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

        this.Set("{project.create.toggle}", "hidden");
        this.projectRender();

    }
    async add() {
        return <>
            <div class="bg-blue-500 border-2 border-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors rounded-lg min-h-28 flex flex-col">
                <button class="fa fa-plus w-full h-full text-2xl text-zinc-900" onclick={ this.projectCreateShow } title="Create Project"></button>
            </div>
        </>
    }
    async render() {
        return <>
            <div class="p-10">
                <div class="w-full h-full flex flex-col space-y-8">
                    <div class="w-full">
                        <label class="text-2xl font-semibold text-zinc-300">Dashboard</label>
                    </div>
                    <div class="grid sm:grid-cols-[repeat(auto-fill,250px)] grid-cols-[repeat(auto-fill,auto)] gap-4">
                        {p.list}
                    </div>
                </div>
                <div id="projectCreate" class="absolute top-0 left-0 w-full h-full bg-zinc-900 text-zinc-800 bg-opacity-90 flex justify-center items-center {project.create.toggle}">
                    <div class="w-full h-full sm:h-auto bg-zinc-300 p-6 space-y-4">
                        <label class="text-xl font-semibold">Create new project</label>
                        <div class="flex flex-col space-y-2">
                            <label class="text-sm font-semibold">Project description</label>
                            <textarea class="resize-none h-20 p-2 text-sm font-semibold bg-zinc-200 border-2 border-zinc-400 rounded-lg placeholder:text-zinc-700 placeholder:text-opacity-70" id="projectCreateBox" placeholder="Describe on what topic you want to create the video..."></textarea>
                            <div class="space-x-2">
                                <button class="p-2 px-6 text-xs text-zinc-200 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors">Create</button>
                                <button class="p-2 px-6 text-xs text-zinc-200 font-semibold rounded-md bg-zinc-500 hover:bg-zinc-600 active:bg-zinc-700 transition-colors" onclick={ this.projectCreateHide }>Cancel</button>
                            </div>
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label class="text-sm font-semibold">Examples:</label>
                            <button class="text-xs text-left" onclick={ () => { this.projectCreateExample(0); } }>&bull; Can you help me in generate a video content for health and fitness ? The video length is around 1 minute.</button>
                            <button class="text-xs text-left" onclick={ () => { this.projectCreateExample(1); } }>&bull; Can you create a content for video on recent space discoveries ?</button>
                        </div>
                    </div>
                </div>
            </div>
        </>;
    }

    async projectRender() {

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

    async projectCreateShow() {
        
        //this.Set("{project.create.toggle}", "visible");
        try {

            const _request = await fetch(`/api/project/create?prompt=hello`);
            const _response = await _request.json();

            if(!_response.success) {
                throw new Error(_response.message);
            };

            //
            await setProjectList({ id: _response.pid })
            await this.projectRender();

        }
        catch(error) {
            console.error(error);
        }

    }

    projectCreateHide() {
        
        this.Set("{project.create.toggle}", "hidden");

    }
    projectCreateExample(index = 0) {

        const _example = [
            "Can you help me in generate a video content for health and fitness ? The video length is around 1 minute.",
            "Can you create a content for video on recent space discoveries ?"
        ];

        this.element.projectCreateBox.value = _example[index];

    }
};