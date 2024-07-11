import Misc from "@library/misc";

const SEvent = {};
const SData = {};

const ServerEvent = {
    Register: function(id = Misc.uuid(), url) {

        if(!!window.EventSource) {

            if(SEvent[id]) {
                console.log("Id already exists");
                return false;
            };

            SEvent[id] = new EventSource(url);
            SData[id] = [];

            SEvent[id].addEventListener("message", (event) => {
                if(typeof(SData[id]) !== "undefined") {
                    SData[id].push(event.data);
                };
            });

        }
        else {
            console.error("Your browser doesn't support SSE");
        };

    },
    /**
        * 
        * @param {*} id 
    */
    Destroy: function(id = Misc.uuid()) {

        
        if(typeof(SEvent[id]) === "undefined") {
            return false;
        };

        SEvent[id].close();

        delete SEvent[id];
        delete SData[id];

    },
    /**
        * 
        * @param {*} id 
        * @param {"message" | "open" | "error"} name 
        * @param {*} callback 
        * @returns 
    */
    Bind: function(id = Misc.uuid(), name, callback) {

        if(typeof(SEvent[id]) === "undefined" || typeof(callback) !== "function") {
            return false;
        };

        SEvent[id].addEventListener(name, callback);

    },
    History: function(id = "") {

        return SData[id];

    },
    HistoryLast: function(id = "") {

        if(typeof(SData[id]) !== "undefined") {
            return SData[id][SData[id].length - 1];
        }
        else {
            return null;
        }

    }
};

export default ServerEvent;