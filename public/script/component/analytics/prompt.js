import "@style/main.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
import Attachment from "@component/attachment";


@Component
export default class Prompt extends H12 {

    constructor() {
        super();
        this.CanFormat = false;
    }

    async init() {

        this.Set("{e.message}", "");
        this.Set("{p.loader}", "hidden");

        Dispatcher.On("OnAnalyticReported", this.OnAnalyticReported.bind(this));
        Dispatcher.On("Marked", () => {

            this.CanFormat = true;
            for(const c in this.child) {
                if(this.child[c] instanceof Bubble) {
                    this.child[c].Format();
                }
            }

        })

    }

    async render() {
        return <>
            <div class="w-full h-full overflow-hidden">
                <div class="w-full h-full p-4 px-5 flex flex-col space-y-3 overflow-auto">
        
                    <div class="border border-transparent border-b-zinc-700 pb-2">
                        <label class="font-semibold text-zinc-400">Prompt</label>
                    </div>

                    <div class="w-full h-full flex flex-col overflow-hidden">
                        <div class="h-full space-y-2 pb-2 flex flex-col overflow-auto" id="PromptHistory">
                            <div class="space-y-2">
                                {e.message}
                            </div>
                            <div class="flex justify-center items-center {p.loader}">
                                <i class="fa fa-spinner text-gray-400"></i>
                            </div>
                        </div>
                        <div>
                            <Attachment args id="Uploader"></Attachment>
                            <div class="bg-zinc-400 flex rounded-lg overflow-hidden">
                                <button class="text-xs font-semibold bg-transparent p-3 hover:bg-zinc-500 active:bg-zinc-600 fa fa-paperclip" onclick={ () => { this.child["Uploader"].Open(); } }></button>
                                <input id="PromptBox" type="text" class="text-xs font-semibold bg-transparent placeholder:text-zinc-600 w-full py-3 resize-none" placeholder="Ask anything..." />
                                <button class="text-xs font-semibold bg-transparent p-3 hover:bg-zinc-500 active:bg-zinc-600" onclick={ () => { this.Send() } } id="PromptButton">Ask</button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>;
    }

    async Load() {

        const { PromptBox, PromptButton, PromptHistory } = this.element;
        PromptButton.disabled = true;
        PromptBox.disabled = true;
        this.Set("{p.loader}", "");

        try {

            this.Set("{e.message}", "", Bubble);

            const _response = await fetch("/api/analytics/history");
            const { success, message, data } = await _response.json();

            if(!_response.ok || !success) {
                throw new Error(message);
            };

            if(Object.keys(data).length > 0) {
                for(const chat of data) {
    
                    const { role, parts } = chat;
                    this.Set("{e.message}++", <><Bubble args text={ parts[0].text } align={ (role == "user" ? "L" : "R") }></Bubble></>);
    
                };
            }
            else {
                if(this.parent.Report) {
                    this.Send(JSON.stringify(this.parent.Report));
                };
            };

            PromptHistory.scrollTo(0, PromptHistory.scrollHeight);

        }
        catch(error) {
            alert(error);
            console.log("C/A/P.Load():", error);
        };

        this.Set("{p.loader}", "hidden");
        PromptButton.disabled = false;
        PromptBox.disabled = false;

    }

    async Send(text) {

        const { PromptBox, PromptButton, PromptHistory } = this.element;
        PromptButton.disabled = true;
        PromptBox.disabled = true;

        try {

            this.Set("{p.loader}", "");
            this.Set("{e.message}++", <><Bubble args text={ text ? text : PromptBox.value } align="L"></Bubble></>);
            PromptHistory.scrollTo(0, PromptHistory.scrollHeight);

            // const _response = await fetch(`/api/analytics/prompt?q=${encodeURIComponent(text ? text : PromptBox.value)}`);
            // const { success, message, data } = await _response.json();
    
            // if(!success || !_response.ok) {
            //     throw new Error(message);
            // };

            // this.Set("{e.message}++", <><Bubble args text={ data } align="R"></Bubble></>);
            // PromptHistory.scrollTo(0, PromptHistory.scrollHeight);
    
        }
        catch(error) {
            alert(error);
            console.log("C/A/P.Send():", error);
        };

        this.Set("{p.loader}", "hidden");
        PromptButton.disabled = false;
        PromptBox.disabled = false;

    }

    async OnAnalyticReported(event) {
        this.Load();
    }

};


class Bubble extends H12 {
    constructor() {
        super();
        this.Visible = false;
    }
    async init({ text }) {

        const { TBox } = this.element;
        if(!this.parent.CanFormat) {
            TBox.innerHTML = (this.IsJson(text) ? "Channel JSON Data" : text);
        }
        else {
            this.Format();
        };

    }
    Format() {

        const { TBox } = this.element;
        const { text } = this.args;
        TBox.innerHTML = marked.parse((this.IsJson(text) ? "(Channel JSON Data)" : text));

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