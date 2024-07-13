import "@style/main.css";
import H12 from "@library/h12";
import Frame from "@library/frame";
import Dispatcher from "@library/h12.dispatcher";

import Card from "@component/frame/dashboard/card";
import Trend from "@component/frame/dashboard/trend";
import Creator from "@component/frame/dashboard/creator";
import Authenticate from "@component/google/authenticate";

@Component
export default class Dashboard extends H12 {
    constructor() {
        super();
    }
    async init() {

        try {

            // Set default template value and load
            this.Set("{d.frame}", "");
            this.Set("{d.trend}", "");
            this.Set("{d.creator}", "");
            this.Load();

        }
        catch(error) {
            alert("Unable to load dashbaord");
            console.error(error);
        };

    }
    async render() {
        return <>
            <div class="w-full h-full p-6 md:p-12">

                <div class="w-full h-full flex flex-col space-y-8 overflow-y-auto">

                    <div class="space-y-3">
                        <div class="w-full flex space-x-0 space-y-2 flex-col sm:flex-row sm:space-x-3 sm:space-y-0">
                            <div class="w-full space-x-3 flex items-center">
                                <button class="fa fa-arrow-left text-md md:text-xl mt-1 text-zinc-500 hover:text-blue-600 active:text-blue-700" onclick={ () => { Dispatcher.Call("OnNavigate", { target: "HOME" }) } }></button>
                                <label class="text-xl md:text-2xl font-semibold text-zinc-300">Dashboard</label>
                            </div>
                            <div>
                                <Authenticate args></Authenticate>
                            </div>
                        </div>
                        <div class="sm:min-h-60">
                            <div class="grid sm:grid-cols-[repeat(auto-fill,250px)] grid-cols-[repeat(auto-fill,auto)] gap-2 sm:gap-4">
                            
                                <div class="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors rounded-lg min-h-24 sm:min-h-28 flex flex-col">
                                    <button class="fa fa-plus w-full h-full text-2xl text-zinc-900" onclick={ this.OpenCreator } title="Create Project"></button>
                                </div>
                                
                                {d.frame}
                                
                            </div>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <div class="w-full flex md:flex-row flex-col">
                            <label class="text-xl md:text-2xl font-semibold text-zinc-300 w-full">Youtube Analytics</label>
                        </div>
                        <div class="grid sm:grid-cols-[repeat(auto-fill,250px)] grid-cols-[repeat(auto-fill,auto)] gap-2 sm:gap-4">
                        
                            <div class="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors rounded-lg min-h-24 sm:min-h-28 flex flex-col" onclick={ () => { Dispatcher.Call("OnNavigate", { target: "ANALYTICS" }) } }>
                                <button class="fa-brands fa-youtube w-full h-full text-2xl text-zinc-900" title="Open analytics"></button>
                            </div>
                            
                        </div>
                    </div>

                </div>

                {d.creator}
                {d.trend}
                
            </div>
        </>;
    }
    async Load() {

        try {

            // Clear the key's value and remove all
            // component reference from the child
            this.Set("{d.frame}", "", Card);

            // Get validated projects and add it to list
            const _project = await Frame.GetValidProject();
            for(var i = 0; i < _project.length; i++) {

                const { title } = _project[i].property;

                this.Set("{d.frame}++", <><Card args title={ title } data={ _project[i] }></Card></>);

            };

        }
        catch(error) {
            console.error(error);
            alert("Unable to load projects, try again later");
        };

    }
    SetCreatorText(text) {
        if(this.child["DCreator"]) {
            this.child["DCreator"].SetPrompt(text);
        };
    }
    async OpenCreator() {

        if(!this.child["DCreator"]) {
            this.Set("{d.creator}", <><Creator args id="DCreator"></Creator></>);
            console.warn("Creater builded");
        };
        this.child["DCreator"].Toggle();

    }
    async OpenTrend() {

        if(!this.child["DTrend"]) {
            this.Set("{d.trend}", <><Trend args id="DTrend"></Trend></>);
            console.warn("Creater builded");
        };
        this.child["DTrend"].Toggle();

    }
};