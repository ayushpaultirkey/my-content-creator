import "@style/main.css";
import H12 from "@library/h12";
import Misc from "@library/misc";
import Config from "@library/config";
import Dispatcher from "@library/h12.dispatcher";

import Video from "@component/analytics/video";
import Graph from "@component/analytics/graph";
import Detail from "@component/analytics/detail";
import Prompt from "@component/analytics/prompt";
import Channel from "@component/analytics/channel";
import Authenticate from "@component/google/authenticate";

@Component
export default class Analytics extends H12 {
    
    constructor() {
        super();
        this.Report = null;
    }

    async init() {

        this.Load();

    }

    async render() {
        return <>
            <div class="w-full h-full relative">
                <div class="w-full h-full flex flex-row relative">

                    <div class="w-full h-full bg-zinc-900 flex-col flex p-4 absolute -left-full md:w-auto md:h-auto md:static md:left-auto" id="NavigationTab">
                        <button onclick={ () => { Dispatcher.Call("OnNavigate", { target: "DASHBOARD" }) } } class="text-left p-2 px-3 rounded-md w-28 text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-blue-500 fa fa-grip"></i>Dashboard</button>
                        <button onclick={ () => { this.Tab(0); } } class="text-left p-2 px-3 rounded-md w-28 text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-red-500 fa-solid fa-wand-magic-sparkles"></i>Prompt</button>
                        <button onclick={ () => { this.Tab(1); } } class="text-left p-2 px-3 rounded-md w-28 text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-orange-500 fa-solid fa-layer-group"></i>Channel</button>
                        <button onclick={ () => { this.Tab(2); } } class="text-left p-2 px-3 rounded-md w-28 text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-blue-500 fa-solid fa-video"></i>Videos</button>
                    </div>

                    <div class="w-full h-full bg-zinc-800 border-r border-zinc-700 absolute -left-full md:min-w-[300px] md:max-w-[300px] lg:min-w-[350px] lg:max-w-[350px] xl:min-w-[450px] xl:max-w-[450px] md:static md:left-auto" id="PropertyTab">
                
                        <div class="w-full h-full" id="AnalyticNav">
                            <Prompt args></Prompt>
                            <Channel args></Channel>
                            <Video args></Video>
                        </div>

                        <div class="absolute right-10 top-5 flex space-x-6 md:hidden">
                            <button class="fa-solid fa-bars text-blue-600 text-md" onclick={ () => { this.Navigate(0); } }></button>
                            <button class="fa-solid fa-arrow-right text-blue-600 text-md" onclick={ () => { this.Navigate(2); } }></button>
                        </div>
                    
                    </div>

                    <div class="w-full h-full absolute left-0 md:static md:left-auto overflow-hidden" id="ViewportTab">
                        <Authenticate args style="absolute right-5 top-5 md:top-10 md:right-10"></Authenticate>
                        <div class="absolute left-5 top-7 flex space-x-6 md:hidden z-10">
                            <button class="fa-solid fa-bars text-blue-500" onclick={ () => { this.Navigate(0); } }></button>
                            <button class="fa-solid fa-pen-to-square text-blue-500" onclick={ () => { this.Navigate(1); } }></button>
                        </div>
                        <div class="w-full h-full overflow-auto">
                            <div id="Viewport">
                                <Graph args></Graph>
                                <Detail args></Detail>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>;
    }

    Navigate(index = 0) {

        const { NavigationTab, ViewportTab, PropertyTab } = this.element;
        Misc.TabNavigate(index, [NavigationTab, PropertyTab, ViewportTab]);

    }

    Tab(index = 0) {

        const _children = Array.from(this.element.AnalyticNav.children);

        if(index >= 0 && index < _children.length) {
            _children.forEach(x => {
                x.classList.add("hidden");
            });
            _children[index].classList.remove("hidden");
        };

        this.Navigate(1);

    }
    
    TabViewport(index = 0) {
        
        const _children = Array.from(this.element.Viewport.children);

        if(index >= 0 && index < _children.length) {
            _children.forEach(x => {
                x.classList.add("hidden");
            });
            _children[index].classList.remove("hidden");
        };

    }

    async Load(param = "") {

        Dispatcher.Call(Config.ON_LOADER_SHOW);
        Dispatcher.Call(Config.ON_LOADER_UPDATE, "Loading analytics report");

        try {

            const _response = await fetch(`/api/analytics/report${param}`);
            const { success, message, data } = await _response.json();
    
            if(!_response.ok || !success) {
                throw new Error(message);
            };

            this.Report = data;
            Dispatcher.Call(Config.ON_ANALYTICS_REPORT, data);

        }
        catch(error) {
            alert(error);
            console.log(error);
        };

        Dispatcher.Call(Config.ON_LOADER_HIDE);

    }

    
};