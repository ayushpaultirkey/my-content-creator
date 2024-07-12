import "@style/main.css";
import H12 from "@library/h12";
import Config from "@library/config";
import ServerEvent from "@library/serverevent.p";
import Dispatcher from "@library/h12.dispatcher";

@Component
export default class Export extends H12 {
    constructor() {
        super();
        this.Project = null;
    }
    async init(args = { project }) {

        // Set the default values for the
        // template fields
        this.Set("{em.visible}", "hidden");
        this.Set("{ev.visible}", "hidden");

        // Check if the project is valid and load it
        if(args.project) {

            this.Project = args.project;
            this.Load();

            // Register the dispatcher event
            // The dispacther event when the project is rendered
            Dispatcher.On(Config.ON_FRENDER_UPDATE, this.OnRenderUpdate.bind(this));

        };

    }
    async render() {
        return <>
            <div class="w-full h-full overflow-hidden hidden">
                <div class="w-full h-full p-4 px-5 flex flex-col space-y-3 overflow-auto">

                    <div class="border border-transparent border-b-zinc-700 pb-3">
                        <label class="font-semibold text-zinc-400"><i class="mr-2 fa-solid fa-cloud-arrow-up"></i>Export</label>
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

        try {

            const { EVideoSource, EVideo } = this.element;

            // Check if the project is valid
            // before loading
            if(!this.Project) {
                return false;
            };

            // Call the api request and check for the success
            // and response status. The api will check if the
            // project have any rendered file
            const _response = await fetch(`/api/frame/project/export/validate?pid=${this.Project.id}`);
            const { success, message, url } = await _response.json();
    
            if(!success || !_response.ok) {
                throw new Error(message);
            };

            // Set video url and load
            // the rendered video
            EVideoSource.src = url;
            EVideo.load();

            // Hide the error message if the file
            // is present
            this.Set("{ev.visible}", "");
            this.Set("{em.visible}", "hidden");

        }
        catch(error) {
            this.Set("{em.visible}", "");
            this.Set("{ev.visible}", "hidden");
            console.error(error);
        };
        
    }
    Download() {

        // Check if the project is valid
        // before downloading
        if(!this.Project) {
            return false;
        };

        window.open(`/api/frame/project/export/get?pid=${this.Project.id}`, "_blank"); 

    }
    Upload = {
        Drive: async() => {

            const { Project, element } = this;
            const { ExportDrive } = element;

            try {

                // Check if the project is valid
                if(!Project) {
                    throw new Error("Invalid project");
                };

                // Disable input elements
                ExportDrive.disabled = true;
                
                // Upload file to google drive by the id
                ServerEvent(`/api/frame/drive/upload?pid=${Project.id}`, {
                    onOpen: () => {
                                        
                        Dispatcher.Call(Config.ON_LOADER_SHOW);
                        Dispatcher.Call(Config.ON_LOADER_UPDATE, "Uploading to drive...");

                    },
                    onMessage: (data) => {

                        Dispatcher.Call(Config.ON_LOADER_UPDATE, data.message);

                    },
                    onFinish: () => {

                        alert("File uploaded to google drive !");
                        Dispatcher.Call(Config.ON_LOADER_HIDE);
                        ExportDrive.disabled = false;

                    },
                    onError: (status, message) => {

                        if(status !== EventSource.CLOSED && message) {
                            alert(message);
                        };
                        Dispatcher.Call(Config.ON_LOADER_HIDE);
                        ExportDrive.disabled = false;

                    }
                });

            }
            catch(error) {
                alert("Unable to upload project, try again later");
                ExportDrive.disabled = false;
                console.error(error);
            };

        },
        Youtube: async() => {

            // Open the youtube uploader panek
            // from the parent
            if(this.parent) {
                this.parent.OpenYTUploader();
            };

        }
    }
    OnRenderUpdate() {

        // Called from dispatcher event when tge
        // project is rendered
        this.Load();

    }
};