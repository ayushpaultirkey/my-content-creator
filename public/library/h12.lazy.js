import Dispatcher from "./h12.dispatcher";

const FILE = {};
const Lazy = {
    Script: (name, url) => {

        if(FILE[name]) {
            return false;
        };
        FILE[name] = false;

        const _script = document.createElement("script");
        _script.src = url;
        _script.type = "text/javascript";
        _script.onload = () => {
            FILE[name] = true;
            Dispatcher.Call(name);
        };
        document.head.appendChild(_script);

    },
    Style: (name, url) => {

        if(FILE[name]) {
            return false;
        };
        FILE[name] = false;

        const _link = document.createElement("link");
        _link.rel = "stylesheet";
        _link.href = url;
        _link.type = "text/css";
        _link.onload = () => {
            FILE[name] = true;
            Dispatcher.Call(name);
        };
        document.head.appendChild(_link);

    },
    Status: (name) => {
        return FILE[name];
    }
};

export default Lazy;