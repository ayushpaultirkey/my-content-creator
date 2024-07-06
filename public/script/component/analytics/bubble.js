import "@style/main.css";
import H12 from "@library/h12";

@Component
export default class Bubble extends H12 {
    constructor() {
        super();
        this.Visible = false;
    }
    async init({ text }) {

        const { TBox } = this.element;
        if(!this.parent.CanFormat) {
            TBox.innerHTML = (this.IsJson(text) ? "(Embedded Channel Data)" : text);
        }
        else {
            this.Format();
        };

    }
    Format() {

        const { TBox } = this.element;
        const { text } = this.args;
        TBox.innerHTML = marked.parse((this.IsJson(text) ? "(Embedded Channel Data)" : text));

    }
    IsJson(data) {
        try {
            JSON.parse(data);
            return true;
        }
        catch {
            return false;
        }
    }
    async render() {

        const { align } = this.args;
        
        return <>
            <div class={ `flex ${(align == "L" ? "justify-end" : "")}` }>
                <div class={ `w-2/3 bg-zinc-500 text-xs font-semibold p-2 rounded-md ${(align == "L" ? "rounded-br-none" : "rounded-bl-none")} shadow-md` }>
                    <label class="break-words" id="TBox"></label>
                </div>
            </div>
        </>

    }
    Toggle() {
        this.Set("{x.text}", (this.Visible) ? "" : this.args.text);
        this.Visible = !this.Visible;
    }
};