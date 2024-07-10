import "@style/main.css";
import H12 from "@library/h12";
import Config from "@library/config";
import Dispatcher from "@library/h12.dispatcher";

import Item from "./asset/item";

@Component
export default class Asset extends H12 {
    constructor() {
        super();
        this.Selected = [];
    }
    async init() {

        this.element.AssetUpload.addEventListener("change", this.#Upload.bind(this));

    }
    async render() {
        return <>
            <div>
                <input type="file" class="hidden" id="AssetUpload" />
                <div class="grid grid-cols-[repeat(auto-fill,56px)] gap-1">
                    {p.asset}
                </div>
            </div>
        </>;
    }
    async Load(asset = [], filter = "image") {

        this.Set("{p.asset}", <>
            <div class="bg-zinc-600 w-14 h-14 rounded-md shadow-md bg-cover bg-center flex justify-center items-center" onclick={ () => { this.element.AssetUpload.click(); } }>
                <label class="text-zinc-400 text-xl fa fa-plus"></label>
            </div>
        </>);

        let _count = 1;
        for(var i = 0, l = asset.length; i < l; i++) {
            if(!asset[i].type.includes(filter)) {
                continue;
            };
            this.Set("{p.asset}++", <><Item args type={ asset[i].type } id={ asset[i].name } url={ asset[i].path } name={ asset[i].name } index={ _count }></Item></>);
            _count++;
        };

    }
    SetSelected(asset = [{ name }]) {

        if(!asset) {
            console.error("Invalid asset");
            return false;
        };

        this.Selected = asset.map(x => x.name);
        for(var item in this.child) {
            this.child[item].SetIndex(this.Selected.indexOf(item));
        };

    }
    OnSelectItem(id) {

        if(!id) {
            console.error("Invalid id");
            return false;
        };

        const _index = this.Selected.indexOf(id);
        
        if(_index === -1) {
            this.Selected.push(id);
        }
        else {
            this.Selected.splice(_index, 1);
        };

        for(var item in this.child) {
            this.child[item].SetIndex(this.Selected.indexOf(item));
        };
        
    }
    GenerateQueryString(name = "asset") {
        return this.Selected.map((item, index) => `${name}[]=${encodeURIComponent(item)}`).join('&');
    }
    async #Upload(event) {
        
        try {

            // Check if the project is valid
            if(!this.args.projectid) {
                throw new Error("Invalid project");
            };

            // Check if the file type is valid
            const _file = event.target.files[0];
            if(_file.type.startsWith("image/") || _file.type.startsWith("video/") || _file.type.startsWith("audio/")) {

                // Check for file
                if(!_file) {
                    console.warn("Invalid file data");
                    return false;
                };

                // Call the api request and check for the success
                // and response status. The api will upload file
                // to the project
                const _url = `/api/frame/asset/upload?pid=${this.args.projectid}`;
                const _form = new FormData();
                _form.append("files", _file);
    
                const _request = await fetch(_url, { method: "POST", body: _form });
                const _response = await _request.json();
    
                if(!_response.success) {
                    throw new Error(_response.message);
                };
    
                // Call dispatcher event to update assets
                Dispatcher.Call(Config.ON_FASSET_UPDATE);
                

            }
            else {
                console.warn("Invalid file type");
                throw new Error("File format not supported");
            };
            
        }
        catch(error) {
            alert(error);
            console.error(error);
        };
        
    }
};