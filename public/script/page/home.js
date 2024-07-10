import "@style/main.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";

@Component
export default class Home extends H12 {
    constructor() {
        super();
    }
    async init() {

    }
    async render() {
        return <>
            <div class="w-full h-full flex flex-col items-start justify-center space-y-4 p-6 md:p-12 gradient">
                <div class="flex flex-col font-semibold text-zinc-300">
                    <label class="text-2xl md:text-3xl">AI tool to quickly create videos using text, documents</label>
                    <label class="text-2xl md:text-3xl">powered by Gemini</label>
                    <label class="text-xs mt-1 md:text-md md:mt-3 text-zinc-500">Generate videos from text, add images, video, sounds, animate them,<br />youtube video analytics much more...</label>
                </div>
                <div class="flex space-x-2">
                    <button class="p-2 px-4 md:p-3 md:px-6 text-xs rounded-md bg-blue-500 font-semibold hover:bg-blue-600 active:bg-blue-700 transition-colors" onclick={ this.OpenDashboard }>Open Dashboard</button>
                </div>
            </div>
        </>;
    }
    OpenDashboard() {
        
        Dispatcher.Call("OnNavigate", { target: "DASHBOARD" });

    }
};