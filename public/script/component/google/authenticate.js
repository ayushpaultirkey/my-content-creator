import "@style/main.css";
import H12 from "@library/h12";
import Google from "@library/google";
import ServerEvent from "@library/serverevent";

@Component
export default class Authenticate extends H12 {

    constructor() {
        super();
    }

    async init(args) {

        this.Set("{g.auth.visible}", "")
        this.Set("{g.auth}", "Connect to Google");
        this.Status();

    }

    async render() {

        const { style } = this.args;

        return <>
            <button class={ `text-xs text-blue-700 font-semibold py-2 w-40 border-2 border-blue-900 bg-blue-950 hover:bg-opacity-70 active:bg-opacity-90 rounded-md {g.auth.visible} ${(!style ? "" : style)}` } onclick={ Google.Authenticate }>
                <i class="fa-brands fa-google mr-2 pointer-events-none"></i>
                <label class="pointer-events-none">{g.auth}</label>
            </button>
        </>;
    }

    CheckHistory() {

        try {
            const _history = ServerEvent.HistoryLast("AuthStatus");
            
            if(!_history) {
                return false;
            };
            
            const _data = JSON.parse(_history);
            this.Set("{g.auth}", ((_data.success) ? "Connected to Google" : "Connect to Google"));

        }
        catch(error) {
            console.error(error);
        };

    }

    Status() {

        this.CheckHistory();
        const _id = "AuthStatus";
        const { Bind, Destroy } = ServerEvent;

        Bind(_id, "open", () => {
            
            console.warn("C/G/A.Authenticate(): opened");
            this.Set("{g.auth.visible}", "");

        });

        Bind(_id, "message", (event) => {

            try {

                const _data = JSON.parse(event.data.split("data:"));
                this.Set("{g.auth}", ((_data.success) ? "Connected to Google" : "Connect to Google"));

            }
            catch(error) {

                this.Set("{g.auth.visible}", "hidden");
                console.error(error);
                Destroy(_id);

            };

        });

        Bind(_id, "error", () => {

            this.Set("{g.auth.visible}", "hidden");
            console.error("auth error");
            Destroy(_id);

        });

    }

};