import "./../../../../style/output.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";

@Component
export default class Card extends H12.Component {
    constructor() {
        super();
    }
    async init(args = { project }) {

        if(typeof(args.project) !== "undefined") {
            this.Set("{c.title}", args.project.property.title);
        };

    }
    async render() {
        
        return <>
            <div class="bg-blue-500 border-2 border-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors rounded-lg p-4 min-h-28 flex flex-col" onclick={ this.OnSelected }>
                <label class="text-xs font-semibold text-zinc-200">{c.title}</label>
            </div>
        </>;

    }
    OnSelected() {

        if(typeof(this.args.project) !== "undefined") {
            Dispatcher.Call("OnNavigate", { target: "EDITOR", project: this.args.project });
        };

    }
};