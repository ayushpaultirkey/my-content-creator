import Config from "@library/config";
import Dispatcher from "@library/h12.dispatcher";


function PreventDefault(event) {
        
    event.preventDefault();
    event.stopPropagation();

}

function BindDrag() {

    // Set file drag n drop event
    ["dragenter", "dragover", "dragleave", "drop"].forEach(name => {
        this.root.addEventListener(name, this.PreventDefault, false);
    });
    ["dragenter", "dragover"].forEach(name => {
        this.root.addEventListener(name, () => this.element.EditorUploader.classList.remove("collapse"), false);
    });
    ["dragleave", "drop"].forEach(name => {
        this.root.addEventListener(name, () => this.element.EditorUploader.classList.add("collapse"), false);
    });
    this.root.addEventListener("drop", this.HandleDrop.bind(this), false);

}

async function HandleDrop(event) {

    // Check if the project is valid
    if(!this.Project) {
        console.error("Invalid project");
        return false;
    };

    const _data = event.dataTransfer;
    const _file = _data.files;

    // Filter the files to be uploaded
    const _filesToUpload = [..._file].filter(x => {
        if(x.type.startsWith("image/") || x.type.startsWith("video/") || x.type.startsWith("audio/")) {
            return true;
        }
        else {
            console.warn(`${x.name} not supported.`);
            return false;
        };
    });

    // Upload all files and wait for the uploads to complete
    try {

        await Promise.all(_filesToUpload.map(file => this.UploadFile(file)));

        // Call dispatcher after all assets are uploaded
        Dispatcher.Call(Config.ON_FASSET_UPDATE);

    }
    catch(error) {
        console.error(error);
    };

}

async function UploadFile(file) {

    try {

        // Call the api request and check for the success
        // and response status. The api will uplaod files
        // to project
        const _url = `/api/frame/asset/upload?pid=${this.Project.id}`;
        const _form = new FormData();
        _form.append("files", file);

        const _response = await fetch(_url, { method: "POST", body: _form });
        const { success, message } = await _response.json();

        if(!success || !_response.ok) {
            throw new Error(message);
        };

    }
    catch(error) {
        alert(error);
        console.error(error);
    };

};

export default { PreventDefault, BindDrag, HandleDrop, UploadFile }