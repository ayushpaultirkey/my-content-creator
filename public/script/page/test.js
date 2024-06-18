import "@style/input.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";

@Component
export default class Test extends H12.Component {
    constructor() {
        super();
    }
    async init() {

    }
    async render() {
        return <>
            <div class="w-full h-full flex flex-col items-start justify-center space-y-4 p-12">
                
                <button class="p-3 px-6 text-xs rounded-md bg-blue-500 font-semibold hover:bg-blue-600 active:bg-blue-700 transition-colors" onclick={ this.OpenDashboard }>Get Started</button>
            </div>
        </>;
    }
};