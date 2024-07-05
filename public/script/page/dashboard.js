import "@style/main.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
import Frame from "@library/frame";

import Card from "@component/frame/dashboard/card";
import Creator from "@component/frame/dashboard/creator";
import Authenticate from "@component/google/authenticate";

@Component
export default class Dashboard extends H12 {

    constructor() {
        super();
    }

    async init() {

        try {
            this.Set("{d.frame}", "")
            this.Set("{d.creator}", "");
            this.Load();
        }
        catch(error) {
            alert("Unable to load dashbaord");
            console.error("D/init():", error);
        };

    }

    async render() {
        return <>
            <div class="w-full h-full p-10">

                <div class="w-full h-full flex flex-col space-y-8 overflow-y-auto">

                    <div class="space-y-3">
                        <div class="w-full flex">
                            <label class="text-2xl font-semibold text-zinc-300 w-full">Dashboard</label>
                            <div class="flex space-x-2">
                                <Authenticate args></Authenticate>
                            </div>
                        </div>
                        <div class="sm:min-h-60">
                            <div class="grid sm:grid-cols-[repeat(auto-fill,250px)] grid-cols-[repeat(auto-fill,auto)] gap-4">
                            
                                <div class="bg-blue-500 border-2 border-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors rounded-lg min-h-28 flex flex-col">
                                    <button class="fa fa-plus w-full h-full text-2xl text-zinc-900" onclick={ this.OpenCreator } title="Create Project"></button>
                                </div>
                                
                                {d.frame}
                                
                            </div>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <div class="w-full flex md:flex-row flex-col">
                            <label class="text-2xl font-semibold text-zinc-300 w-full">Youtube Analytics</label>
                        </div>
                        <div class="grid sm:grid-cols-[repeat(auto-fill,250px)] grid-cols-[repeat(auto-fill,auto)] gap-4">
                        
                            <div class="bg-blue-500 border-2 border-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors rounded-lg min-h-28 flex flex-col" onclick={ () => { Dispatcher.Call("OnNavigate", { target: "ANALYTICS" }) } }>
                                <button class="fa-brands fa-youtube w-full h-full text-2xl text-zinc-900" title="Open analytics"></button>
                            </div>
                            
                        </div>
                    </div>

                </div>

                {d.creator}
                
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
            console.error("D.Load():", error);
            alert("Unable to load projects, try again later");
        };

    }

    async OpenCreator() {

        if(!this.child["DCreator"]) {
            this.Set("{d.creator}", <><Creator args id="DCreator"></Creator></>);
            console.warn("D.OpenCreator(): Creater component builded");
        };
        this.child["DCreator"].Toggle();

    }

};