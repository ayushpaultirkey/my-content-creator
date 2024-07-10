import "@style/main.css";
import H12 from "@library/h12";

@Component
export default class Bubble extends H12 {
    constructor() {
        super();
    }
    async init({ text }) {

        // Get the dom elements from root element of the
        // component by its id
        const { TBox } = this.element;

        // Check if the text can be formatted
        // from the parent's component property
        if(!this.parent.CanFormat) {
            TBox.innerText = (this.IsJson(text) ? "*(Embedded JSON)*" : text);
        }
        else {
            this.Format();
        };

    }
    Format() {

        // Format the chat bubble text using marked.parse()
        // and dompurify to remove the html elements
        // This can be called from the parent component ie. prompt.js
        const { TBox } = this.element;
        const { text } = this.args;
        TBox.innerHTML = marked.parse((this.IsJson(text) ? "*(Embedded JSON)*" : DOMPurify.sanitize(text)));

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
};