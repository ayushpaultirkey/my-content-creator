import "@style/main.css";
import H12 from "@library/h12";

@Component
export default class Item extends H12 {
    constructor() {
        super();
    }
    async init(args = { url, name, index, type }) {

        this.Set("{i.visible}", "hidden");

    }
    async render() {

        if(this.args.type.includes("image")) {
            return <>
                <div class="bg-zinc-600 w-14 h-14 rounded-md shadow-md bg-cover bg-center relative" style={ `background-image: url(${this.args.url});` } title={ this.args.name } onclick={ this.OnSelect }>
                    <label class="bg-blue-500 text-xs px-2 font-semibold border-2 border-zinc-800 text-zinc-100 absolute bottom-0 left-0 rounded-md {i.visible}">{a.index}</label>
                </div>
            </>;
        }
        else {
            return <>
                <div class="bg-zinc-600 w-14 h-14 rounded-md shadow-md bg-cover bg-center relative" title={ this.args.name } onclick={ this.OnSelect }>
                    <video class="w-full h-full pointer-events-none" oncanplay="this.muted=true;" loop autoplay muted>
                        <source type="video/mp4" src={ this.args.url } />
                    </video>
                    <label class="bg-blue-500 text-xs px-2 font-semibold border-2 border-zinc-800 text-zinc-100 absolute bottom-0 left-0 rounded-md {i.visible}">{a.index}</label>
                </div>
            </>;
        };

    }
    OnSelect() {
        this.parent.OnSelectItem(this.args.name);
    }
    SetIndex(index = 0) {

        if(index === -1) {
            this.Set("{i.visible}", "hidden");
        }
        else {
            this.Set("{i.visible}", "");
            this.Set("{a.index}", index + 1);
        }

    }
};