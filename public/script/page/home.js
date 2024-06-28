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
            <div class="w-full h-full flex flex-col items-start justify-center space-y-4 p-12">
                <label class="text-3xl font-semibold text-zinc-300 ">AI tool to quickly create videos with text</label>
                <label class="text-3xl font-semibold text-zinc-300 ">powered by Gemini</label>
                <label class="text-md font-semibold text-zinc-500">Generate videos from text, add images, sounds, animate them and much more...</label>
                <button class="p-3 px-6 text-xs rounded-md bg-blue-500 font-semibold hover:bg-blue-600 active:bg-blue-700 transition-colors" onclick={ this.OpenDashboard }>Get Started</button>
            </div>
        </>;
    }
    OpenDashboard() {
        
        Dispatcher.Call("OnNavigate", { target: "DASHBOARD" });

    }
};