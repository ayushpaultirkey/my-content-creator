import "@style/main.css";
import H12 from "@library/h12";
import Lazy from "@library/h12.lazy";
import Config from "@library/config";
import ServerEvent from "@library/serverevent";
import Dispatcher from "@library/h12.dispatcher";

import Home from "./page/home";
import Editor from "./page/frame";
import Dashboard from "./page/dashboard";
import Analytics from "./page/analytics";

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
        Dispatcher.On(Config.ON_LOADER_SHOW, this.Loader.Show.bind(this));
        Dispatcher.On(Config.ON_LOADER_HIDE, this.Loader.Hide.bind(this));
        Dispatcher.On(Config.ON_LOADER_UPDATE, this.Loader.Update.bind(this));
        Dispatcher.On("OnNavigate", this.Navigate.To.bind(this));

        // Register server side event
        ServerEvent.Register("AuthStatus", "/api/google/auth/status");

        // Lazy load library
        Lazy.Script("DOMPurify", "https://cdn.jsdelivr.net/npm/dompurify/dist/purify.min.js");
        Lazy.Style("FAIcon", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css");

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
        },
        Update: (event, args) => {
            this.Set("{a.loader.text}", args);
        },
        Hide: () => {
            this.Set("{a.loader}", "hidden");
        }
    }
    Navigate = {
        To: (event, args = { target: "HOME" }) => {

            switch(args.target) {
                case "EDITOR":
                    this.Navigate.Editor(args.project);
                    break;
                case "DASHBOARD":
                    this.Navigate.Dashboard(args);
                    break;
                case "ANALYTICS":
                    this.Navigate.Analytics(args);
                    break;
                default:
                    this.Navigate.Home(args);
                    break;
            }

        },
        Home: async() => {
            this.Set("{e.app}", <><Home args></Home></>);
        },
        Dashboard: async() => {
            this.Set("{e.app}", <><Dashboard args></Dashboard></>);
        },
        Editor: async(project = null) => {
            this.Set("{e.app}", <><Editor args project={ project }></Editor></>);
        },
        Analytics: async() => {

            try {
                
                Lazy.Script("Marked", "https://cdn.jsdelivr.net/npm/marked/marked.min.js");
                Lazy.Script("GChart", "https://www.gstatic.com/charts/loader.js");

                const _authStat = ServerEvent.HistoryLast("AuthStatus");
                if(!_authStat) {
                    throw new Error("Invalid auth data");
                }
                const { success } = JSON.parse(_authStat);
                if(!success) {
                    throw new Error("Google account not authenticated");
                };
                this.Set("{e.app}", <><Analytics args></Analytics></>);

            }
            catch(error) {
                alert(error);
                console.error(error);
            };
            
        }
    }
};

// Render application
H12.Render(App, ".app");