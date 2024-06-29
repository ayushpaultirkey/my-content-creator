import "@style/main.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
import ServerEvent from "@library/serverevent";

import Home from "./page/home";
import Editor from "./page/project/editor";
import Dashboard from "./page/project/dashboard";

@Component
class App extends H12 {

    constructor() {
        super();
    }

    async init() {

        // Navigate to dashboard
        this.Navigate.To();
        this.Set("{a.loader}", "hidden");
        this.Set("{a.loader.text}", "Please Wait, AI Is Crafting...");

        // Register dispatcher event
        Dispatcher.On("ShowLoader", this.Loader.Show.bind(this));
        Dispatcher.On("HideLoader", this.Loader.Hide.bind(this));
        Dispatcher.On("OnNavigate", this.Navigate.To.bind(this));

        // Register server side event
        ServerEvent.Register("AuthStatus", "/api/google/auth/status");

    }

    async render() {
        return <>
            <div class="w-full h-full relative">
                
                <div class="w-full h-full">
                    {e.app}
                </div>
                <div class="bg-zinc-900 bg-opacity-85 backdrop-blur-sm w-full h-full absolute top-0 left-0 flex flex-col justify-center items-center text-zinc-300 {a.loader}">
                    <i class="fas fa-splotch fa-spin text-2xl text-blue-500"></i>
                    <label class="text-sm font-semibold">{a.loader.text}</label>
                </div>
                
            </div>
        </>;
    }

    finally() {
        Dispatcher.Call("Loaded");
    }

    Loader = {
        Show: (event, args) => {
            this.Set("{a.loader}", "");
            this.Set("{a.loader.text}", args);
        },
        Hide: () => {
            this.Set("{a.loader}", "hidden");
        }
    }

    Navigate = {
        To: (event, args = { target: "DASHBOARD" }) => {

            switch(args.target) {
                case "EDITOR":
                    this.Navigate.Editor(args.project);
                    break;
                case "DASHBOARD":
                    this.Navigate.Dashboard(args);
                    break;
                default:
                    this.Navigate.Home(args);
                    break;
            }

        },
        Home: async () => {
            this.Set("{e.app}", <><Home args></Home></>);
        },
        Dashboard: async () => {
            this.Set("{e.app}", <><Dashboard args></Dashboard></>);
        },
        Editor: async (project = null) => {
            this.Set("{e.app}", <><Editor args project={ project }></Editor></>);
        }
    }
};

//
H12.Render(App, ".app");