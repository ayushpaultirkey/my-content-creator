import "@style/main.css";
import H12 from "@library/h12";
import Item from "./asset/item";
import Dispatcher from "@library/h12.dispatcher";

@Component
export default class Asset extends H12 {

    constructor() {
        super();
        this.Selected = [];
    }

    async init() {

        // Register on input file
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

        for(var i = 0, l = asset.length; i < l; i++) {
            if(!asset[i].type.includes(filter)) {
                continue;
            };
            this.Set("{p.asset}++", <><Item args type={ asset[i].type } id={ asset[i].name } url={ asset[i].url } name={ asset[i].name } index={ i + 1 }></Item></>);
        };

    }

    SetSelected(asset = [{ name }]) {

        if(!asset) {
            console.error("Component/Asset.OnSelectedItem(): Invalid asset");
            return false;
        };

        this.Selected = asset.map(x => x.name);

        for(var item in this.child) {
            this.child[item].SetIndex(this.Selected.indexOf(item));
        };

    }

    OnSelectItem(id) {

        if(!id) {
            console.error("Component/Asset.OnSelectedItem(): Invalid id");
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

            if(!this.args.projectid) {
                throw new Error("Invalid project");
            };

            const _file = event.target.files[0];

            //
            if(_file.type.startsWith("image/") || _file.type.startsWith("video/") || _file.type.startsWith("audio/")) {

                // Check for file
                if(!_file) {
                    console.warn(`Component/Asset.Upload(): File data invalid.`);
                    return false;
                };

                // Build request body
                const _url = `/api/asset/upload?pid=${this.args.projectid}`;
                const _form = new FormData();
                _form.append("files", _file);
    
                // Send request
                const _request = await fetch(_url, { method: "POST", body: _form });
                const _response = await _request.json();
    
                // Check or request
                if(!_response.success) {
                    throw new Error(_response.message);
                };
    
                // Call dispatcher event
                Dispatcher.Call("OnAssetUpdated");
                

            }
            else {

                console.warn(`Component/Asset.Upload(): File ${_file.name} is not supported and was not uploaded.`);
                throw new Error("File format not supported");

            };
            

        }
        catch(error) {
            alert(error);
            console.error(error);
        };
        


    }

};