import "./../../../style/output.css";
import H12 from "@library/h12";

@Component
export default class Dashboard extends H12.Component {
    constructor() {
        super();
    }
    async init() {

        this.Set("{project.create.toggle}", "hidden");

    }
    async render() {
        return <>
            <div id="projectDashboard">
                <div class="w-full h-full flex flex-col space-y-8">
                    <div class="w-full">
                        <label class="text-2xl font-semibold text-gray-300">Projects</label>
                    </div>
                    <div class="grid sm:grid-cols-[repeat(auto-fill,250px)] grid-cols-[repeat(auto-fill,auto)] gap-4">
                        <div class="bg-blue-500 border-2 border-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors rounded-lg p-4 min-h-28 flex flex-col">
                            <div class="h-full flex flex-col">
                                <label class="text-xs font-semibold text-gray-200">5 Minute Morning Routine for a Healthier You</label>
                                <label class="text-xs font-semibold text-gray-200 opacity-50">12-06-2024 at 12:25 PM</label>
                            </div>
                            <div class="mt-3">
                                <button class="fa fa-trash text-gray-900"></button>
                            </div>
                        </div>
                        <div class="bg-blue-500 border-2 border-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors rounded-lg p-4 min-h-28 flex flex-col">
                            <button class="fa fa-plus w-full h-full text-2xl text-gray-900" onclick={ this.ShowCreateProject }></button>
                        </div>
                    </div>
                </div>
                <div id="projectCreate" class="absolute top-0 left-0 w-full h-full bg-gray-900 text-gray-800 bg-opacity-90 flex justify-center items-center {project.create.toggle}">
                    <div class="w-full h-full sm:h-auto bg-gray-300 p-6 space-y-4">
                        <label class="text-xl font-semibold">Create new project</label>
                        <div class="flex flex-col space-y-2">
                            <label class="text-sm font-semibold">Project description</label>
                            <textarea class="resize-none h-20 p-2 text-sm font-semibold bg-gray-200 border-2 border-gray-400 rounded-lg placeholder:text-gray-700 placeholder:text-opacity-70" id="projectCreateBox" placeholder="Describe on what topic you want to create the video..."></textarea>
                            <div class="space-x-2">
                                <button class="p-2 px-6 text-xs text-gray-200 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors">Create</button>
                                <button class="p-2 px-6 text-xs text-gray-200 font-semibold rounded-md bg-gray-500 hover:bg-gray-600 active:bg-gray-700 transition-colors" onclick={ this.HideCreateProject }>Cancel</button>
                            </div>
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label class="text-sm font-semibold">Examples:</label>
                            <button class="text-xs text-left" onclick={ () => { this.ExampleCreateProject(0); } }>&bull; Can you help me in generate a video content for health and fitness ? The video length is around 1 minute.</button>
                            <button class="text-xs text-left" onclick={ () => { this.ExampleCreateProject(1); } }>&bull; Can you create a content for video on recent space discoveries ?</button>
                        </div>
                    </div>
                </div>
            </div>
        </>;
    }
    ShowCreateProject() {
        
        this.Set("{project.create.toggle}", "visible");

    }
    HideCreateProject() {
        
        this.Set("{project.create.toggle}", "hidden");

    }
    ExampleCreateProject(index = 0) {

        const _example = [
            "Can you help me in generate a video content for health and fitness ? The video length is around 1 minute.",
            "Can you create a content for video on recent space discoveries ?"
        ];

        this.element.projectCreateBox.value = _example[index];

    }
};