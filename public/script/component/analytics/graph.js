import "@style/main.css";
import H12 from "@library/h12";
import Lazy from "@library/h12.lazy";
import Config from "@library/config";
import Dispatcher from "@library/h12.dispatcher";

@Component
export default class Graph extends H12 {
    constructor() {
        super();
        this.Report = null;
        this.ResizeRegistered = false;
    }
    async init() {

        // Register the dispatcher event
        // This will be called when the Google Chart library is loaded,
        // and when the report is updated
        Dispatcher.On("GChart", this.Load.bind(this));
        Dispatcher.On(Config.ON_ANALYTICS_REPORT, this.OnAnalyticReport.bind(this));

    }
    async render() {
        return <>
            <div class="w-full h-full pt-12">
                <div style="height: 450px; width: 100%;"></div>
            </div>
        </>;
    }
    async Load() {

        try {

            // Check if the report is valid and then
            // load the graph
            if(!this.Report) {
                throw new Error("Invalid report data");
            };
            this.LoadGraph(this.Report.channel.analytic);

        }
        catch(error) {
            console.error(error);
        };

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
    
            var _chart = new google.visualization.LineChart(this.root)
            _chart.draw(_data, options);

            if(!this.ResizeRegistered) {
                window.onresize = () => {
                    _chart.draw(_data, options);
                };
            };

            this.ResizeRegistered = true;

        });

    }
    async OnAnalyticReport(event, report) {

        // Called from dispatcher event to update the report data
        // The dispatcher event can be called across the app
        // Registered in init()
        if(report) {
            this.Report = report;
            if(Lazy.Status("GChart")) {
                this.Load();
            };
        };
        
    }
};