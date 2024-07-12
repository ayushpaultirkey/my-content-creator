import "@style/main.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";

@Component
export default class Card extends H12 {
    constructor() {
        super();
    }
    async init({ title }) {

        if(title) {
            this.Set("{c.title}", title);
        };

    }
    async render() {
        
        return <>
            <div class="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors rounded-lg p-4 min-h-24 sm:min-h-28 flex flex-col" onclick={ this.OnSelected }>
                <label class="text-xs font-semibold text-zinc-900">{c.title}</label>
            </div>
        </>;

    }
    OnSelected() {

        if(this.args.data) {
            Dispatcher.Call("OnNavigate", { target: "EDITOR", project: this.args.data });
        };

    }
};