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
                
                <Dashboard args></Dashboard>
                
            </div>
        </>;
    }
};

//
H12.Component.Render(App, ".app");