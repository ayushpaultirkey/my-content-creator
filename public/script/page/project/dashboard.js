import "./../../../style/output.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";

import Card from "./dashboard/card";
import { GetLocalProject, SetLocalProject } from "../../module/project";

@Component
export default class Dashboard extends H12.Component {
    constructor() {
        super();
    }
    async init() {

        this.Set("{d.create.toggle}", "hidden");
        this.Load();

    }
    async render() {
        return <>
            <div class="w-full h-full p-10">
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
                            <label class="text-sm font-semibold">Project description:</label>
                            <textarea class="resize-none h-20 p-2 text-sm font-semibold bg-zinc-200 border-2 border-zinc-400 rounded-lg placeholder:text-zinc-700 placeholder:text-opacity-70" id="ProjectCreatePrompt" placeholder="Describe on what topic you want to create the video..."></textarea>
                            <label class="text-sm font-semibold">Dimensions:</label>
                            <div>
                                <input type="number" class="w-24 p-2 text-xs font-semibold bg-zinc-200 border-2 border-zinc-400 rounded-lg placeholder:text-zinc-700 placeholder:text-opacity-70" value="720" id="ProjectCreateW" placeholder="Width" />
                                <label class="text-sm font-semibold mx-2">x</label>
                                <input type="number" class="w-24 p-2 text-xs font-semibold bg-zinc-200 border-2 border-zinc-400 rounded-lg placeholder:text-zinc-700 placeholder:text-opacity-70" value="1280" id="ProjectCreateH" placeholder="Height" />
                            </div>
                            <div class="space-x-2">
                                <button class="p-2 px-6 text-xs text-zinc-200 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors" onclick={ this.CreateProject }>Create</button>
                                <button class="p-2 px-6 text-xs text-zinc-200 font-semibold rounded-md bg-zinc-500 hover:bg-zinc-600 active:bg-zinc-700 transition-colors" onclick={ () => { this.ToggleCreateProject(false); } }>Cancel</button>
                            </div>
                        </div>
                        <div class="flex flex-col space-y-1">
                            <label class="text-sm font-semibold">Examples:</label>
                            <button class="text-xs text-left" onclick={ () => { this.AddExamplePrompt(0); } }>&bull; Can you help me in generate a video content for health and fitness ? The video length is around 1 minute.</button>
                            <button class="text-xs text-left" onclick={ () => { this.AddExamplePrompt(1); } }>&bull; Can you create a content for video on recent space discoveries ?</button>
                            <button class="text-xs text-left" onclick={ () => { this.AddExamplePrompt(2); } }>&bull; Surprise me !</button>
                        </div>
                    </div>
                </div>
            </div>
        </>;
    }

    async Load() {

        // Try and load projects
        try {

            // Add a create project button
            this.Set("{p.list}", <>
                <div class="bg-blue-500 border-2 border-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors rounded-lg min-h-28 flex flex-col">
                    <button class="fa fa-plus w-full h-full text-2xl text-zinc-900" onclick={ () => { this.ToggleCreateProject(); } } title="Create Project"></button>
                </div>
            </>);

            // Get validated projects and add it to list
            const _project = await GetLocalProject();
            for(var i = 0; i < _project.length; i++) {
                this.Set("++{p.list}", <><Card args project={ _project[i] }></Card></>);
            };

        }
        catch(error) {
            console.error("Dashboard/Load():", error);
            alert("Unable to load projects, try again later");
        };

    }

    async CreateProject() {

        // Call dispatcher event
        Dispatcher.Call("ShowLoader", "AI is creating project...");

        // Try and create project using prompt
        try {

            // Get prompt, width, height
            const _width = this.element.ProjectCreateW.value;
            const _height = this.element.ProjectCreateH.value;
            const _prompt = this.element.ProjectCreatePrompt.value;

            // Check the values
            if(_prompt.length < 5) {
                alert("Please enter the project description");
                throw new Error("Project description required");
            };
            if(_width < 128 || _height < 128) {
                alert("Please check the dimension is greather than 128");
                throw new Error("Dimension should be greater than 128");
            };
            
            // Send request and validate the response
            const _request = await fetch(`/api/project/create?prompt=${_prompt}&width=${_width}&height=${_height}`);
            const _response = await _request.json();

            if(!_response.success) {
                throw new Error(_response.message);
            };

            // Store the project id and refresh the dashboard
            await SetLocalProject({ id: _response.data.id });
            await this.Load();

            // Hide the create project panel
            this.ToggleCreateProject(false);

        }
        catch(error) {
            console.error("Dashboard/CreateProject():", error);
        };

        // Call dispatcher event
        Dispatcher.Call("HideLoader", "AI is creating project...");

    }

    ToggleCreateProject(visible = true) {

        this.Set("{d.create.toggle}", ((visible) ? "" : "hidden"));

    }

    AddExamplePrompt(index = 0) {

        const _prompt = [
            "Can you help me in generate a video content for health and fitness ? The video length is around 1 minute.",
            "Can you create a content for video on recent space discoveries ?",
            "Surprise me !"
        ];
        this.element.ProjectCreatePrompt.value = _prompt[index];

    }

};