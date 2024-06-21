import "@style/output.css";
import H12 from "@library/h12";

@Component
export default class Item extends H12.Component {
    constructor() {
        super();
    }
    async init(args = { url, name, index, type }) {

        this.Set("{a.visible}", "hidden");

    }
    async render() {
        return <>
            <div class="bg-zinc-600 w-14 h-14 rounded-md shadow-md bg-cover bg-center relative" style={ `background-image: url(${this.args.url});` } title={ this.args.name } onclick={ this.OnSelect }>
                <label class="bg-blue-500 text-xs px-2 font-semibold border-2 border-zinc-800 text-zinc-100 absolute bottom-0 left-0 rounded-md {a.visible}">{a.index}</label>
            </div>
        </>;
    }

    OnSelect() {
        this.parent.OnSelectItem(this.args.name);
    }

    SetIndex(index = 0) {

        if(index === -1) {
            this.Set("{a.visible}", "hidden");
        }
        else {
            this.Set("{a.visible}", "");
            this.Set("{a.index}", index + 1);
        }

    }

};