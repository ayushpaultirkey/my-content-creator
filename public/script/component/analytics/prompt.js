import "@style/main.css";
import H12 from "@library/h12";
import Lazy from "@library/h12.lazy";
import Config from "@library/config";
import Dispatcher from "@library/h12.dispatcher";

import Attachment from "@component/attachment";
import Bubble from "./bubble";

@Component
export default class Prompt extends H12 {
    constructor() {
        super();
        this.Report = null;
        this.CanFormat = false;
    }
    async init() {

        // Set the default values for the
        // template fields
        this.Set("{e.message}", "");
        this.Set("{p.loader}", "hidden");

        // Get the text box and register input event
        // when enter is pressed to send prompt
        const { PromptBox } = this.element;
        PromptBox.addEventListener("keyup", (event) => {
            if(event.key === "Enter") {
                this.Send();
            };
        })

        // Register the dispatcher event
        // The dispacther event to update the report data nad when the marked
        // and dompurify is loaded to format the text
        Dispatcher.On(Config.ON_ANALYTICS_REPORT, this.OnAnalyticReport.bind(this));
        Dispatcher.On(Config.ON_ANALYTICS_CPROMPT, this.OnAnalyticReport.bind(this));
        Dispatcher.On("Marked", () => { this.ApplyFormat(); });
        Dispatcher.On("DOMPurify", () => { this.ApplyFormat(); });
        this.ApplyFormat();

    }
    async render() {
        return <>
            <div class="w-full h-full overflow-hidden">
                <div class="w-full h-full p-4 px-5 flex flex-col space-y-3 overflow-hidden">
        
                    <div class="border border-transparent border-b-zinc-700 pb-3">
                        <label class="font-semibold text-zinc-400"><i class="mr-2 fa-solid fa-wand-magic-sparkles"></i>Prompt</label>
                    </div>

                    <div class="w-full h-full flex flex-col overflow-hidden">
                        <div class="h-full space-y-2 pb-2 flex flex-col overflow-auto" id="PromptHistory">
                            <div class="space-y-2">
                                {e.message}
                            </div>
                            <div class="flex justify-center items-center {p.loader}">
                                <i class="fa fa-splotch fa-spin text-xl text-gray-400"></i>
                            </div>
                        </div>
                        <div>
                            <Attachment args id="FUploader"></Attachment>
                            <div class="bg-zinc-400 flex rounded-lg overflow-hidden">
                                <button class="text-xs font-semibold bg-transparent p-3 hover:bg-zinc-500 active:bg-zinc-600 fa fa-paperclip" onclick={ () => { this.child["FUploader"].Open(); } }></button>
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

        // Disable component elements
        const { PromptBox, PromptButton, PromptHistory } = this.element;
        PromptButton.disabled = true;
        PromptBox.disabled = true;

        try {

            // Clear the old chat messages and remove
            // the component
            this.Set("{e.message}", "", Bubble);

            // Get the chat history from the report
            // and create new bubble component for it
            const { history } = this.Report;
            for(const chat of history) {
                
                // Get the role and part from message
                // this is similar to gemini chat structure
                const { role, parts } = chat;
                const _text = (parts[0].fileData) ? "*(Embedded File)*" : parts[0].text;

                // Append the new chat bubble
                this.Set("{e.message}++", <><Bubble args text={ _text } align={ (role == "user" ? "L" : "R") }></Bubble></>);

            };
            
            // Scroll to bottom after rendering
            // the component
            PromptHistory.scrollTo(0, PromptHistory.scrollHeight);

        }
        catch(error) {
            alert(error);
            console.log(error);
        };

        // Enable component elements
        PromptButton.disabled = false;
        PromptBox.disabled = false;

    }
    async Send() {

        // Disable component elements
        const { PromptBox, PromptButton, PromptHistory } = this.element;
        PromptButton.disabled = true;
        PromptBox.disabled = true;

        try {

            // Get the prompt value and the file
            // that is to be uploaded
            const { FUploader } = this.child;
            const _prompt = PromptBox.value;
            const _file = FUploader.File;

            // Check if the prompt value is not empty
            // and the file is valid
            if(_prompt.trim().length === 0 && _file == null) {
                throw new Error("Please enter the prompt or attach file");
            };

            // Clear the text box value and remove the
            // attached file from the component. Simply
            // to reset the values to default
            PromptBox.value = "";
            FUploader.AttachRemove();

            // Show the loader and add the prompt bubble
            // at the end and scroll to bottom
            this.Set("{p.loader}", "");
            this.Set("{e.message}++", <><Bubble args text={ _prompt } align="L"></Bubble></>);
            PromptHistory.scrollTo(0, PromptHistory.scrollHeight);

            // Call the api request and check for the success
            // and response status. The api will generate answer
            // using prompt and file
            const _url = `/api/analytics/prompt?q=${encodeURIComponent(_prompt)}`;
            const _form = new FormData();
            _form.append("files", _file);

            const _response = await fetch(_url, { method: "POST", body: _form });
            const { success, message, data } = await _response.json();

            if(!success || !_response.ok) {
                throw new Error(message);
            };

            // Call dispatcher event to update the report data
            // with other components
            Dispatcher.Call(Config.ON_ANALYTICS_CPROMPT, data);
    
        }
        catch(error) {
            alert(error);
            console.log(error);
        };

        // Enable component elements and hide
        // the chat loader
        this.Set("{p.loader}", "hidden");
        PromptButton.disabled = false;
        PromptBox.disabled = false;

    }
    ApplyFormat() {
        
        // Apply formatting to the chat messages
        // once the marked and dompurify is loaded
        if(Lazy.Status("Marked") && Lazy.Status("DOMPurify")) {
            this.CanFormat = true;
            for(const c in this.child) {
                if(this.child[c] instanceof Bubble) {
                    this.child[c].Format();
                };
            }
        };

    }
    async OnAnalyticReport(event, report) {

        // Called from dispatcher event to update the report data
        // The dispatcher event can be called across the app
        // Registered in init()
        if(report) {
            this.Report = report;
            this.Load();
        };

    }
};


