import "@style/main.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
import Attachment from "@component/attachment";
import Lazy from "@library/h12.lazy";
import Config from "@library/@config";
import Bubble from "./bubble";

@Component
export default class Prompt extends H12 {

    constructor() {
        super();
        this.Report = null;
        this.CanFormat = false;
    }

    async init() {

        //
        this.Set("{e.message}", "");
        this.Set("{p.loader}", "hidden");

        //
        const { PromptBox } = this.element;
        PromptBox.addEventListener("keyup", (event) => {
            if(event.key === "Enter") {
                this.Send();
            };
        })

        //
        Dispatcher.On(Config.ON_ANALYTICS_REPORT, this.OnAnalyticReport.bind(this));
        Dispatcher.On("Marked", () => { this.ApplyFormat(); });
        if(Lazy.Status("Marked")) {
            this.ApplyFormat();
        };

    }

    async render() {
        return <>
            <div class="w-full h-full overflow-hidden">
                <div class="w-full h-full p-4 px-5 flex flex-col space-y-3 overflow-auto">
        
                    <div class="border border-transparent border-b-zinc-700 pb-3">
                        <label class="font-semibold text-zinc-400"><i class="mr-2 fa-solid fa-wand-magic-sparkles"></i>Prompt</label>
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

        try {

            this.Set("{e.message}", "", Bubble);

            const { history } = this.Report;

            for(const chat of history) {
    
                const { role, parts } = chat;
                this.Set("{e.message}++", <><Bubble args text={ parts[0].text } align={ (role == "user" ? "L" : "R") }></Bubble></>);

            };

            PromptHistory.scrollTo(0, PromptHistory.scrollHeight);

        }
        catch(error) {
            alert(error);
            console.log("C/A/P.Load():", error);
        };

        PromptButton.disabled = false;
        PromptBox.disabled = false;

    }

    async Send(text) {

        const { PromptBox, PromptButton, PromptHistory } = this.element;
        PromptButton.disabled = true;
        PromptBox.disabled = true;

        try {

            if(PromptBox.value.trim().length === 0) {
                throw new Error("Please enter something, before asking");
            };

            const _prompt = text ? text : PromptBox.value;
            PromptBox.value = "";

            this.Set("{p.loader}", "");
            this.Set("{e.message}++", <><Bubble args text={ _prompt } align="L"></Bubble></>);
            PromptHistory.scrollTo(0, PromptHistory.scrollHeight);

            const _response = await fetch(`/api/analytics/prompt?q=${encodeURIComponent(_prompt)}`);
            const { success, message, data } = await _response.json();
    
            if(!success || !_response.ok) {
                throw new Error(message);
            };

            this.Set("{e.message}++", <><Bubble args text={ data } align="R"></Bubble></>);
            PromptHistory.scrollTo(0, PromptHistory.scrollHeight);
    
        }
        catch(error) {
            alert(error);
            console.log("C/A/P.Send():", error);
        };

        this.Set("{p.loader}", "hidden");
        PromptButton.disabled = false;
        PromptBox.disabled = false;

    }

    ApplyFormat() {
        this.CanFormat = true;
        for(const c in this.child) {
            if(this.child[c] instanceof Bubble) {
                this.child[c].Format();
            };
        }
    }

    async OnAnalyticReport(event, report) {
        
        if(report) {
            this.Report = report;
            this.Load();
        };

    }

};


