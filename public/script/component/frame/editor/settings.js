import "@style/main.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
import Config from "@library/config";

@Component
export default class Settings extends H12 {
    constructor() {
        super();
        this.Project = null;
    }
    async init(args = { project }) {

        // Check if the project is valid and set
        // the project
        if(args.project) {

            this.Project = args.project;

        };

    }
    async render() {
        return <>
            <div class="w-full h-full overflow-hidden hidden">
                <div class="w-full h-full p-4 px-5 flex flex-col space-y-3 overflow-auto">

                    <div class="border border-transparent border-b-zinc-700 pb-3">
                        <label class="font-semibold text-zinc-400"><i class="mr-2 fa-solid fa-gear"></i>Settings</label>
                    </div>

                    <div class="pt-3">
                        <button class="p-2 px-6 text-xs text-zinc-200 font-semibold rounded-md bg-red-500 hover:bg-red-600 active:bg-red-700 transition-colors" onclick={ this.Delete }>Delete Project</button>
                    </div>

                    <div class="flex flex-col">
                        <label class="text-xs font-semibold text-zinc-400">Note:</label>
                        <label class="text-xs text-zinc-400">The deleted project cannot be recovered, all the assets will be deleted.</label>
                    </div>

                </div>
            </div>
        </>;
    }
    async Delete() {

        // Check if the project is valid
        if(!this.Project) {
            alert("Invalid project");
        };
        
        // Confirm for deletion the project
        if(confirm("Delete the project ?")) {

            // Display loader
            Dispatcher.Call(Config.ON_LOADER_SHOW);
            Dispatcher.Call(Config.ON_LOADER_UPDATE, "Deleting project...");

            try {

                const { id: pid } = this.Project;
    
                const _response = await fetch(`/api/frame/project/delete?pid=${pid}`);
                const { success, message } = await _response.json();
    
                if(!success) {
                    throw new Error(message);
                };

                alert("Project deleted");
                Dispatcher.Call("OnNavigate", { target: "DASHBOARD" });

            }
            catch(error) {
                console.error(error);
                alert(error);
            };

            // Hide loader
            Dispatcher.Call(Config.ON_LOADER_HIDE);

        };

    }
};