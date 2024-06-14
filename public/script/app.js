import "./../style/output.css";
import H12 from "@library/h12";
import Home from "./page/home";
import Dashboard from "./page/project/dashboard";
import Editor from "./page/project/editor";


@Component
class App extends H12.Component {
    constructor() {
        super();
    }
    async init() {


    }
    async render() {
        return <>
            <div class="w-full h-full relative">
                
                <div class="w-full h-full">
                    <Editor args></Editor>
                </div>
                <div class="bg-zinc-900 bg-opacity-85 backdrop-blur-sm w-full h-full absolute top-0 left-0 flex flex-col justify-center items-center text-zinc-300 hidden">
                    <i class="fas fa-splotch fa-spin text-2xl text-blue-500"></i>
                    <label class="text-sm font-semibold">Please Wait, AI Is Crafting...</label>
                </div>
                
            </div>
        </>;
    }
};

//
H12.Component.Render(App, ".app");