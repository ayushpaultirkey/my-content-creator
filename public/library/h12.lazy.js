import Dispatcher from "./h12.dispatcher";

const FILE = [];
const Lazy = {
    Script: (name, url) => {

        if(FILE.indexOf(name) !== -1) {
            return false;
        };

        const _script = document.createElement("script");
        _script.src = url;
        _script.type = "text/javascript";
        _script.onload = () => {
            FILE.push(name);
            Dispatcher.Call(name);
        };
        document.head.appendChild(_script);

    },
    Style: (name, url) => {

        if(FILE.indexOf(name) !== -1) {
            return false;
        };

        const _link = document.createElement("link");
        _link.rel = "stylesheet";
        _link.href = url;
        _link.type = "text/css";
        _link.onload = () => {
            FILE.push(name);
            Dispatcher.Call(name);
        };
        document.head.appendChild(_link);

    }
};

export default Lazy;