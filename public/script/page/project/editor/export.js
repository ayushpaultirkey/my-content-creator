import "@style/main.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
import MyCreator from "@library/mycreator";
import ServerEvent from "@library/serverevent";

@Component
export default class Export extends H12 {

    constructor() {
        super();
        this.Project = null;
    }

    async init(args = { project }) {

        // Set data
        this.Set("{em.visible}", "hidden");
        this.Set("{ev.visible}", "hidden");

        // Check if the project is valid and load it
        if(MyCreator.Project.IsValid(args.project)) {

            // Set project and load
            this.Project = args.project;
            this.Load();

            // Bind dispatcher event
            Dispatcher.On("OnRenderUpdated", this.OnRenderUpdated.bind(this));

        };

    }

    async render() {
        return <>
            <div class="w-full h-full overflow-hidden hidden">
                <div class="w-full h-full p-4 px-5 flex flex-col space-y-3 overflow-auto">

                    <div class="border border-transparent border-b-zinc-700 pb-2">
                        <label class="font-semibold text-zinc-400">Export</label>
                    </div>

                    <div class="space-y-1">
                        <label class="text-xs font-semibold text-zinc-400">Publish options:</label>
                        <button class="block w-full p-2 px-6 text-xs text-zinc-200 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors" id="ExportYoutube" onclick={ this.Upload.Youtube }><i class="fa-brands fa-youtube mr-2"></i>Publish To Youtube</button>
                        <button class="block w-full p-2 px-6 text-xs text-zinc-200 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors" id="ExportDrive" onclick={ this.Upload.Drive }><i class="fa-brands fa-google-drive mr-2"></i>Save to Google Drive</button>
                        <button class="block w-full p-2 px-6 text-xs text-zinc-200 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors" onclick={ this.Download }><i class="fa-solid fa-download mr-2"></i>Download</button>
                    </div>

                    <div class="space-y-1 flex flex-col">
                        <label class="text-xs font-semibold text-zinc-400 block mb-1">Preview:</label>
                        <label class="text-xs font-semibold text-red-500 {em.visible}">No file found to export, render the project from Project tab.</label>
                        <video class="w-full {ev.visible} rounded-lg overflow-hidden" id="EVideo" controls>
                            <source type="video/mp4" id="EVideoSource" />
                        </video>
                    </div>

                </div>
            </div>
        </>;
    }

    async Load() {

        // Check if the project is valid
        if(!MyCreator.Project.IsValid(this.Project)) {
            return false;
        };

        // Try to check for files to export
        try {

            // Check for files to export
            const _request = await fetch(`/api/project/export/validate?pid=${this.Project.id}`);
            const _response = await _request.json();
    
            // Throw error on false success
            if(!_response.success) {
                throw new Error(_response.message);
            };

            // Set video url
            this.element.EVideoSource.src = _response.url;
            this.element.EVideo.load();

            // If success then hide the message
            this.Set("{ev.visible}", "");
            this.Set("{em.visible}", "hidden");

        }
        catch(error) {
            
            // Log and show message
            this.Set("{em.visible}", "");
            this.Set("{ev.visible}", "hidden");
            console.error("Editor/Export/LoadAsset():", error);

        };
        
    }

    Download() {

        // Check if the project is valid
        if(!MyCreator.Project.IsValid(this.Project)) {
            return false;
        };

        window.open(`/api/project/export/get?pid=${this.Project.id}`, "_blank"); 

    }
    Upload = {
        Drive: async() => {

            // Check if the project is valid
            if(!MyCreator.Project.IsValid(this.Project)) {
                return false;
            };

            try {

                // Disable button
                this.element.ExportDrive.disabled = true;

                // Register new server send event
                const _source = new EventSource(`/api/project/export/drive?pid=${this.Project.id}`);                
                _source.onopen = () => { Dispatcher.Call("OnLoaderShow"); }
                _source.onmessage = (event) => {

                    console.log(event.data)
                    // // Try and get response
                    // try {

                    //     // Get response data and check if success and finished
                    //     const _data = JSON.parse(event.data.split("data:"));
                    //     if(!_data.success) {
                    //         throw new Error(_data.message);
                    //     };

                    //     // Check if the file is uploaded
                    //     if(_data.finished) {
                    //         alert("File uploaded to google drive !");
                    //     };

                    //     // Call dispather show loader
                    //     Dispatcher.Call("OnLoaderUpdate", _data.message);

                    // }
                    // catch(error) {

                    //     // Alert, hide loader and enable button
                    //     alert(error);
                    //     Dispatcher.Call("OnLoaderHide");
                    //     this.element.ExportDrive.disabled = false;
                    //     _source.close();

                    // };

                };
                _source.onerror = () => {

                    // Hide loader and enable button on error
                    Dispatcher.Call("OnLoaderHide");
                    this.element.ExportDrive.disabled = false;
                    _source.close();

                };

            }
            catch(error) {

                // Alert and log
                alert("Unable to render project, try again later");
                console.error("Editor/Project.Drive():", error);
                this.element.ExportDrive.disabled = false;
                
            };

        },
        Youtube: async() => {

            if(this.parent && this.parent.child["GYoutube"]) {
                this.parent.OpenYoutube();
            };

        }
    }

    OnRenderUpdated() {
        this.Load();
    }

};