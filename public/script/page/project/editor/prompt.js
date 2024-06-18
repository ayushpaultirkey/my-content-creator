import "@style/output.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
import { ProjectIsValid } from "../../../module/project";

@Component
export default class Prompt extends H12.Component {
    constructor() {
        super();
        this.Project = null;
    }

    async init(args = { project }) {

        // Check if the project is valid and load it
        if(ProjectIsValid(args.project)) {

            this.Project = args.project;
            this.Load();

            // Register on dispatcher event
            Dispatcher.On("OnProjectUpdate", this.OnProjectUpdate.bind(this));

        };

    }

    async render() {
        return <>
            <div class="w-full h-full overflow-hidden" id="projectTPrompt">
                <div class="w-full h-full p-4 px-5 flex flex-col space-y-3 overflow-auto">

                    <div class="border border-transparent border-b-zinc-700 pb-2">
                        <label class="font-semibold text-zinc-400">Prompt</label>
                    </div>

                    <div class="w-full h-full flex flex-col overflow-hidden">
                        <div class="h-full space-y-2 pb-2 flex flex-col overflow-auto">
                            {e.message}
                        </div>
                        <div class="bg-zinc-400 flex rounded-lg overflow-hidden">
                            <input id="promptBox" type="text" class="text-xs font-semibold bg-transparent placeholder:text-zinc-600 w-full p-3 resize-none" placeholder="Ask anything..." />
                            <button class="text-xs font-semibold bg-transparent p-3 hover:bg-zinc-500 active:bg-zinc-600" onclick={ this.Update }>Ask</button>
                        </div>
                    </div>

                </div>
            </div>
        </>;
    }

    async Load() {

        // Check if the project is valid
        if(!ProjectIsValid(this.Project)) {
            return false;
        };

        // Try and render the messages
        try {

            // Clear the old messages before loading
            this.Set("{e.message}", "");
    
            // Get message array from the project
            const _context = this.Project.session.context;

            // Iterate over all project messages
            for(var i = 0, l = _context.length; i < l; i++) {
    
                //
                let _messageA = _context[i][0];
                let _messageB = _context[i][1]
                let _messageBO = "";

                const _regex = /```json(.*)```/gs;
                const _match = _regex.exec(_messageB);
                if(_match) {
                    _messageBO = JSON.parse(_match[1].trim());
                }
                else {
                    throw new Error("Invalid AI response");
                };

                // Create a template for the message bubble
                const _chatA = <>
                    <div class="flex justify-end">
                        <div class={ `w-2/3 bg-zinc-500 text-xs font-semibold p-2 rounded-md rounded-br-none shadow-md` }>
                            <label>{ ~_messageA }</label>
                        </div>
                    </div>
                </>;
                const _chatB = <>
                    <div>
                        <div class={ `w-2/3 bg-zinc-500 text-xs font-semibold p-2 rounded-md rounded-bl-none shadow-md` }>
                            <label>{ ~_messageBO.response }</label>
                        </div>
                    </div>
                </>;
    
                // Add the template at the end
                this.Set("{e.message}++", _chatA);
                this.Set("{e.message}++", _chatB);
    
            };
        }
        catch(error) {
            console.error(error);
        };

    }

    async Update() {

        // Call dispather show loader
        Dispatcher.Call("ShowLoader", "AI is updating slide...");

        try {

            // Get project id and the slide's id by the index
            const _projectId = this.Project.id;
            const _prompt = this.element.promptBox.value;

            // Check prompt text
            if(_prompt.length < 5) {
                alert("Enter prompt !");
                throw new Error("Enter prompt");
            }

            // Perform the update request
            const _request = await fetch(`/api/prompt/run?pid=${_projectId}&prompt=${_prompt}`);
            const _response = await _request.json();

            // Check if the data is updated successfully
            if(!_response.success) {
                alert(_response.message);
                throw new Error(_response.message);
            };

            // Update project data
            Dispatcher.Call("OnProjectUpdate", _response.data);

        }
        catch(error) {
            console.error(error);
        };

        // Call dispather hide loader
        Dispatcher.Call("HideLoader");

    }

    OnProjectUpdate(event, project) {

        // Check if the project is valid and load it
        if(ProjectIsValid(project)) {

            this.Project = project;
            this.Load();

        };

    };

};