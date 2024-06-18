import "@style/output.css";
import H12 from "@library/h12";
import Item from "./asset/item";

@Component
export default class Asset extends H12.Component {
    constructor() {
        super();
        this.Selected = [];
    }
    async init() {}
    async render() {
        return <>
            <div class="grid sm:grid-cols-[repeat(auto-fill,56px)] grid-cols-[repeat(auto-fill,auto)] gap-1">
                {p.asset}
            </div>
        </>;
    }
    async Load(asset = [], filter = "image/png") {

        this.Set("{p.asset}", "");

        for(var i = 0, l = asset.length; i < l; i++) {

            if(asset[i].type !== filter) {
                continue;
            };

            this.Set("{p.asset}++", <><Item args id={ asset[i].name } url={ asset[i].url } name={ asset[i].name } index={ i + 1 }></Item></>);

        };

    }
    OnSelectItem(id) {

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
};