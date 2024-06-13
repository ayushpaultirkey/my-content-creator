import "./../../style/output.css";
import H12 from "@library/h12";

@Component
export default class Home extends H12.Component {
    constructor() {
        super();
    }
    async init() {

    }
    async render() {
        return <>
            <div class="flex flex-col items-start space-y-4">
                <label class="text-3xl font-semibold text-gray-300 ">AI tool to quickly create videos with text</label>
                <label class="text-md font-semibold text-gray-500">Generate videos from text, add images, sounds, animate them and much more...</label>
                <button class="p-3 px-6 text-xs rounded-md bg-blue-500 font-semibold hover:bg-blue-600 active:bg-blue-700 transition-colors">Get Started</button>
            </div>
        </>;
    }
};