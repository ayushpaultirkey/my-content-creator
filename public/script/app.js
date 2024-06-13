import "./../style/output.css";
import H12 from "@library/h12";
import Home from "./page/home";
import Dashboard from "./page/project/dashboard";


@Component
class App extends H12.Component {
    constructor() {
        super();
    }
    async init() {


    }
    async render() {
        return <>
            <div class="w-full h-full sm:p-12 p-4 relative">
                
                <div class="h-full flex flex-row border border-gray-700 rounded-md">
                    <div class="bg-gray-800 flex-col sm:flex hidden">
                        <button class="text-left p-2 pl-3 w-32 text-xs text-gray-400">Prompt</button>
                        <button class="text-left p-2 pl-3 w-32 text-xs text-gray-400">Fine Tune</button>
                        <button class="text-left p-2 pl-3 w-32 text-xs text-gray-400">Export</button>
                        <button class="text-left p-2 pl-3 w-32 text-xs text-gray-400">Dashboard</button>
                        <button class="text-left p-2 pl-3 w-32 text-xs text-gray-400">Settings</button>
                    </div>
                    <div class="w-80 bg-gray-700 flex-col sm:flex hidden">
                        
                        <div id="projectTPrompt" class="w-full h-full flex flex-col">
                            <div class="p-2 text-xs font-semibold text-gray-400">
                                <label>Prompt</label>
                            </div>
                            <div class="w-full h-full flex flex-col">
                                <div class="h-full p-2">
                                    df
                                </div>
                                <div>
                                    <input type="text" />
                                    <button>Ask</button>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div class="w-full h-full flex flex-col overflow-hidden">
                        <div class="bg-gray-800 w-full h-full flex justify-center items-center">
                            
                            <div class="bg-gray-300 w-60 h-96 shadow-lg border border-gray-500"></div>

                        </div>
                        <div class="bg-gray-700 w-full h-24">
                            
                            <div class="flex flex-row bg-gray-800 border-t border-gray-700 h-full p-3 space-x-3 overflow-auto">
                                <div class="bg-gray-300 w-14 min-w-14 h-full rounded-md shadow-md"></div>
                            </div>

                        </div>
                    </div>
                </div>
                
            </div>
        </>;
    }
};

//
H12.Component.Render(App, ".app");