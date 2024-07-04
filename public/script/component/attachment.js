import "@style/main.css";
import H12 from "@library/h12";

@Component
export default class Attachment extends H12 {

    constructor() {
        super();
        this.File = null;
    }

    async init(args = { project }) {

        // Set default value
        this.Set("{u.name}", "");
        this.Set("{u.visible}", "hidden");

        // Register on input file
        this.element.FileUpload.addEventListener("change", this.AttachFile.bind(this));

    }

    async render() {
        return <>
            <div>
                <input type="file" class="hidden" id="FileUpload" />
                <div class="mb-2">
                    <span class="bg-zinc-700 px-4 pb-1 rounded-2xl relative {u.visible}">
                        <label class="text-xs font-semibold text-zinc-400">{u.name}</label>
                        <button class="text-sm font-semibold text-zinc-400 pl-2" onclick={ this.AttachRemove }>&times;</button>
                    </span>
                </div>
            </div>
        </>;
    }

    Open() {
        this.element.FileUpload.click();
    }

    AttachFile(event) {
        
        const _file = event.target.files[0];

        if(_file.type.startsWith("image/") || _file.type.startsWith("video/") || _file.type.startsWith("audio/")) {
            if(_file) {

                this.File = _file;
    
                this.Set("{u.name}", _file.name);
                this.Set("{u.visible}", "");
    
            };
        }
        else {
            console.warn(`Attachment/AttachFile(): File ${_file.name} is not supported and was not uploaded.`);
            alert("File format not supported");
        };

    }

    AttachRemove() {
        this.File = null;
        this.Set("{u.name}", "");
        this.Set("{u.visible}", "hidden");
    }

};