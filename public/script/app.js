import "./../style/output.css";
import H12 from "@library/h12";
import Home from "./page/home";
import Dashboard from "./page/project/dashboard";
import Editor from "./page/project/editor";
import Dispatcher from "@library/h12.dispatcher";


@Component
class App extends H12.Component {
    constructor() {
        super();
    }
    async init() {

        this.Set("{a.loader}", "hidden");
        this.Set("{a.loader.text}", "Please Wait, AI Is Crafting...");

        Dispatcher.On("ShowLoader", this.showLoader.bind(this));
        Dispatcher.On("HideLoader", this.hideLoader.bind(this));

    }
    async render() {
        return <>
            <div class="w-full h-full relative">
                
                <div class="w-full h-full">
                    <Dashboard args></Dashboard>
                </div>
                <div class="bg-zinc-900 bg-opacity-85 backdrop-blur-sm w-full h-full absolute top-0 left-0 flex flex-col justify-center items-center text-zinc-300 {a.loader}">
                    <i class="fas fa-splotch fa-spin text-2xl text-blue-500"></i>
                    <label class="text-sm font-semibold">{a.loader.text}</label>
                </div>
                
            </div>
        </>;
    }

    showLoader(event, args) {
        this.Set("{a.loader}", "");
        this.Set("{a.loader.text}", args);
    }
    hideLoader() {
        this.Set("{a.loader}", "hidden");
    }

    load() {
        Dispatcher.Call("Loaded");
    }
};

//
H12.Component.Render(App, ".app");