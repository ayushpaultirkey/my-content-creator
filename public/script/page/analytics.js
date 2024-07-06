import "@style/main.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
import Prompt from "@component/analytics/prompt";
import Lazy from "@library/h12.lazy";
import Authenticate from "@component/google/authenticate";
import Channel from "@component/analytics/channel";
import Config from "@library/@config";

@Component
export default class Analytics extends H12 {
    
    constructor() {
        super();
        this.Report = null;
    }

    async init() {

        if(Lazy.Status("GChart")) {
            this.Load();
        };
        Dispatcher.On("GChart", this.Load.bind(this));

    }

    async render() {
        return <>
            <div class="w-full h-full relative GGH">
                
                <div class="w-full h-full flex flex-row relative">

                    <div class="w-full h-full bg-zinc-900 flex-col flex p-4 absolute -left-full md:w-auto md:h-auto md:static md:left-auto" id="NavigationTab">
                        <button class="text-left p-2 px-3 rounded-md w-28 text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-blue-500 fa fa-grip"></i>Dashboard</button>
                        <button onclick={ () => { this.Tab(0); } } class="text-left p-2 px-3 rounded-md w-28 text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-red-500 fa-solid fa-wand-magic-sparkles"></i>Prompt</button>
                        <button onclick={ () => { this.Tab(1); } } class="text-left p-2 px-3 rounded-md w-28 text-xs text-zinc-400 bg-zinc-700 bg-opacity-0 hover:bg-opacity-50 active:bg-opacity-70 group"><i class="mr-2 transition-colors group-hover:text-blue-500 fa-solid fa-layer-group"></i>Channel</button>
                    </div>

                    <div class="w-full h-full bg-zinc-800 border-r border-zinc-700 absolute -left-full md:min-w-[300px] md:max-w-[300px] lg:min-w-[400px] lg:max-w-[400px] md:static md:left-auto" id="PropertyTab">
                
                        <div class="w-full h-full" id="AnalyticNav">
                            <Prompt args></Prompt>
                            <Channel args></Channel>
                        </div>

                        <div class="absolute right-10 top-3 flex space-x-6 md:hidden">
                            <button class="fa-solid fa-bars text-blue-500 text-xl" onclick={ () => { this.Scroll(0); } }></button>
                            <button class="fa-solid fa-arrow-right text-blue-500 text-xl" onclick={ () => { this.Scroll(2); } }></button>
                        </div>
                    
                    </div>

                    <div class="w-full h-full absolute left-0 md:static md:left-auto overflow-hidden p-4">
                        <Authenticate args style="absolute top-10 right-10"></Authenticate>
                        <div class="absolute left-6 top-6 flex space-x-6 md:hidden z-10">
                            <button class="fa-solid fa-bars text-blue-500" onclick={ () => { this.Scroll(0); } }></button>
                            <button class="fa-solid fa-pen-to-square text-blue-500" onclick={ () => { this.Scroll(1); } }></button>
                        </div>

                        <div class="w-full h-full flex justify-center items-center">
                            <div id="chart" style="height: 450px; width: 100%;"/>
                        </div>

                    </div>

                </div>

            </div>
        </>;
    }

    Scroll(index = 0) {

        // const { NavigationTab, ViewportTab, PropertyTab } = this.element;

        // switch(index) {
        //     case 0:
        //         NavigationTab.classList.add("left-0");
        //         NavigationTab.classList.remove("-left-full");
        //         ViewportTab.classList.add("-left-full");
        //         ViewportTab.classList.remove("left-0");
        //         PropertyTab.classList.add("-left-full");
        //         PropertyTab.classList.remove("left-0");
        //         break;
        //     case 1:
        //         NavigationTab.classList.add("-left-full");
        //         NavigationTab.classList.remove("left-0");
        //         ViewportTab.classList.add("-left-full");
        //         ViewportTab.classList.remove("left-0");
        //         PropertyTab.classList.add("left-0");
        //         PropertyTab.classList.remove("-left-full");
        //         break;
        //     case 2:
        //         NavigationTab.classList.add("-left-full");
        //         NavigationTab.classList.remove("left-0");
        //         PropertyTab.classList.add("-left-full");
        //         PropertyTab.classList.remove("left-0");
        //         ViewportTab.classList.add("left-0");
        //         ViewportTab.classList.remove("-left-full");
        //         break;

        // }

    }
    Tab(index = 0) {

        const _children = Array.from(this.element.AnalyticNav.children);

        if(index >= 0 && index < _children.length) {
            _children.forEach(x => {
                x.classList.add("hidden");
            });
            _children[index].classList.remove("hidden");
        };

        this.Scroll(1);

    }

    async Load() {

        Dispatcher.Call(Config.ON_LOADER_SHOW);
        Dispatcher.Call(Config.ON_LOADER_UPDATE, "Loading analytics report");

        try {

            const _response = await fetch("/api/analytics/report");
            const { success, message, data } = await _response.json();
    
            if(!_response.ok || !success) {
                throw new Error(message);
            };

            this.Report = data;
            this.LoadGraph(data.analytic);
            Dispatcher.Call(Config.ON_ANALYTICS_REPORT, data);

        }
        catch(error) {
            alert(error);
            console.log(error);
        };

        Dispatcher.Call(Config.ON_LOADER_HIDE);

    }

    LoadGraph(data) {

        google.charts.load("current", { "packages": [ "corechart" ]});
        google.charts.setOnLoadCallback(() => {

            var _data = google.visualization.arrayToDataTable([
                data.columnHeaders.map(x => x.name),
                ... data.rows
            ]);
    
            var options = {
                title: 'Channel Performance (1 Month)',
                curveType: 'linear',
                legend: {
                    position: 'bottom',
                    textStyle: {
                        color: 'rgb(161, 161, 170)',
                        fontSize: 10,
                    }
                },
                backgroundColor: 'transparent',
                titleTextStyle: {
                    color: 'gray',
                    fontSize: 10,
                },
                hAxis: {
                    textStyle: {
                        color: 'rgb(161, 161, 170)',
                        fontSize: 8,
                    },
                    gridlines: {
                        color: 'rgb(39, 39, 42)'
                    }
                },
                vAxis: {
                    textStyle: {
                        color: 'rgb(161, 161, 170)',
                        fontSize: 10,
                    },
                    gridlines: {
                        color: 'rgb(20, 39, 42)',
                        count: 3
                    }
                }
            };
    
            var _chart = new google.visualization.LineChart(this.element.chart)
            _chart.draw(_data, options);

            window.onresize = () => {
                _chart.draw(_data, options);
            };

        });

    }
    
};