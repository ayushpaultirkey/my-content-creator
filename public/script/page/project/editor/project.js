import "@style/output.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
import { ProjectIsValid } from "../../../module/project";
import Asset from "./asset";

@Component
export default class Project extends H12.Component {
    constructor() {
        super();
        this.Project = null;
        this.ImageOrder = [];
    }

    async init(args = { project }) {

        // Check if the project is valid and load it
        if(ProjectIsValid(args.project)) {

            //
            this.Project = args.project;
            this.Load();

            //
            ["dragenter", "dragover", "dragleave", "drop"].forEach(name => {
                this.root.addEventListener(name, this.PreventDefault, false);
            });
            ["dragenter", "dragover"].forEach(name => {
                this.root.addEventListener(name, () => this.element.uploadHighlight.classList.remove("hidden"), false);
            });
            ["dragleave", "drop"].forEach(name => {
                this.root.addEventListener(name, () => this.element.uploadHighlight.classList.add("hidden"), false);
            });
            this.root.addEventListener("drop", this.HandleDrop.bind(this), false);

            // Register on dispatcher event
            Dispatcher.On("OnProjectUpdate", this.OnProjectUpdate.bind(this));

        };

    }

    async render() {
        return <>
            <div class="w-full h-full overflow-hidden hidden relative">
                <div class="w-full h-full p-4 px-5 flex flex-col space-y-3 overflow-auto">

                    <div class="border border-transparent border-b-zinc-700 pb-2">
                        <label class="font-semibold text-zinc-400">Project</label>
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-zinc-400">Backgound Images:</label>
                        <Asset args id="imageAsset"></Asset>
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-zinc-400">Audio:</label>
                        <input type="file" class="block text-xs font-semibold text-zinc-400" />
                    </div>

                    <div class="pt-3">
                        <button class="p-2 px-6 text-xs text-zinc-200 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors">Update</button>
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-zinc-400">Tips:</label>
                        <div>
                            <label class="text-xs text-zinc-400">Ask the AI in prompt tab to modify the slide, like reorder slides, change color, content, animation, or create new slides.</label>
                        </div>
                    </div>

                </div>
                <div class="absolute w-full h-full bg-zinc-900 backdrop-blur-sm bg-opacity-50 top-0 left-0 pointer-events-none flex justify-center items-center hidden" id="uploadHighlight">
                    <div>
                        <label class="text-zinc-100 text-xs font-semibold">Upload</label>
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

        try {

            this.Set("{p.image}", "");

            const _request = await fetch(`/api/asset/read?pid=${this.Project.id}`);
            const _response = await _request.json();

            if(!_response.success) {
                alert(_response.message);
                throw new Error(_response.message);
            };

            this.child["imageAsset"].Load(_response.data);

        }
        catch(error) {
            console.error(error);
        };

    }

    PreventDefault(event) {
        
        event.preventDefault();
        event.stopPropagation();

    }
    HandleDrop(event) {

        // Check if the project is valid
        if(!ProjectIsValid(this.Project)) {
            return false;
        };

        const _data = event.dataTransfer;
        const _file = _data.files;

        ([..._file]).forEach(x => {
            if (x.type.startsWith("image/") || x.type.startsWith("video/")) {
                this.UploadFile(x);
            }
            else {
                console.warn(`File ${x.name} is not supported and was not uploaded.`);
            }
        });

    }
    async UploadFile(file) {

        try {

            const _url = `/api/asset/upload?pid=${this.Project.id}`;
            const _form = new FormData();
            _form.append("files", file);

            const _request = await fetch(_url, { method: "POST", body: _form });
            const _response = await _request.json();

            if(!_response.success) {
                throw new Error(_response.message);
            };

            this.Load();

        }
        catch(error) {
            alert(error);
            console.error(error);
        };

    }

    OnProjectUpdate(event, project) {

        // Check if the project is valid and load it
        if(ProjectIsValid(project)) {

            this.Project = project;
            this.Load();

        };

    };

};