import "@style/main.css";
import H12 from "@library/h12";

@Component
export default class Viewer extends H12 {

    constructor() {
        super();
        this.Selected = [];
        this.NextPage = null;
    }

    async init() {

        this.Set("{d.list}", "");
        this.Set("{d.spin}", "");

    }

    async render() {
        return <>
            <div class="absolute top-0 left-0 w-full h-full bg-zinc-900 text-zinc-800 bg-opacity-90 flex justify-center items-center collapse">
                    
                <div class="w-full bg-zinc-200 p-6 space-y-5">
                    <div class="flex items-center space-x-3 text-zinc-800">
                        <i class="fa-brands fa-google-drive text-2xl"></i>
                        <label class="font-semibold w-full">Google Drive</label>
                        <button class="fa fa-refresh {d.spin}" onclick={ this.Load }></button>
                    </div>
                    <div class="space-y-2">
                        {d.list}
                    </div>
                    <div class="space-x-2">
                        <button class="p-2 px-6 text-xs text-blue-100 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors" onclick={ this.#Import }><i class="fa fa-download mr-2"></i>Import</button>
                        <button class="p-2 px-6 text-xs text-zinc-300 font-semibold rounded-md bg-zinc-600 hover:bg-zinc-700 active:bg-zinc-800 transition-colors" onclick={ this.Hide }><i class="fa fa-xmark mr-2"></i>Cancel</button>
                    </div>
                </div>

            </div>
        </>;
    }

    Show() {
        this.root.classList.remove("collapse");
        this.Load();
    }

    Hide() {
        this.root.classList.add("collapse");
    }

    Select(id = "") {
        if(!this.Selected.includes(id)) {
            this.Selected.push(id);
        }
        else{
            this.Selected.splice(this.Selected.indexOf(id), 1);
        };
    }

    async Load() {

        // Try and get google drive files
        try {

            // Reset values before loading
            this.Selected = [];
            this.Set("{d.list}", "");
            this.Set("{d.spin}", "fa-spin");

            // Fetch google drive files
            const _response = await fetch(`/api/google/drive/getfile${(this.NextPage) ? `?next=${this.NextPage}` : ""}`);
            const { success, message, data } = await _response.json();
            
            // Check if the request was successfull
            if(!success || !_response.ok) {
                throw new Error(message);
            };

            // Iterate over files and render them
            const _file = data.files;
            this.NextPage = data.nextPage;

            for(var i = 0, len = _file.length; i < len; i++) {

                // Get id, mime
                let { id, mimeType } = _file[i];
                let _icon = "";

                // Create icon for file
                if(mimeType.includes("image")) {
                    _icon = "fa-image";
                }
                else if(mimeType.includes("video")) {
                    _icon = "fa-video";
                }
                else if(mimeType.includes("audio")) {
                    _icon = "fa-volume-high";
                }
                else {
                    _icon = "fa-file";
                };

                // Create item template
                const _item = <>
                    <div class="flex items-center space-x-3">
                        <input type="checkbox" onclick={ () => { this.Select(id); } } />
                        <i class={ `fa ${_icon}` }></i>
                        <label class="text-xs font-semibold">{ _file[i].name }</label>
                        <a href={ _file[i].webViewLink } target="_blank" rel="noopener noreferrer" class="text-xs font-semibold text-blue-700 underline">View</a>
                    </div>
                </>;

                // Render item
                this.Set("{d.list}++", _item);

            }

        }
        catch(error) {
            alert(error.message);
            console.error(error);
        }

        this.Set("{d.spin}", "");

    }

    async OnImport() {}
    async #Import() {
        this.OnImport();
    }

};