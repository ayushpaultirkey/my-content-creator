import "@style/main.css";
import H12 from "@library/h12";

/**
    * Region code by ISO-3166-Countries-with-Regional-Codes
    * Licensed under CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/)
*/
import Regions from "@data/region.json";

@Component
export default class Trend extends H12 {
    constructor() {
        super();
    }
    async init() {

        this.Load();
        this.Build();

    }
    async render() {
        return <>
            <div class="absolute top-0 left-0 w-full h-full bg-zinc-900 text-zinc-800 bg-opacity-90 flex justify-center items-center overflow-hidden {d.visible}">
                <div class="w-full max-h-full min-h-full sm:min-h-max bg-zinc-300 p-4 sm:p-6 space-y-6 overflow-scroll">
                    <div class="flex flex-row items-center space-x-6">
                        <label class="text-md sm:text-xl font-semibold w-full"><i class="fa fa-arrow-trend-up mr-2"></i>Trending<label class="text-xs block text-zinc-500">Click on description to expand it</label></label>
                        <button class="text-md font-semibold rounded-md text-zinc-600 hover:text-zinc-700 active:text-zinc-800 transition-colors fa fa-refresh" onclick={ () => { this.Load(); } }></button>
                        <button class="text-xl font-semibold rounded-md text-zinc-600 hover:text-zinc-700 active:text-zinc-800 transition-colors fa fa-xmark" onclick={ () => { this.Toggle(false); } }></button>
                    </div>
                    <div>
                        <select id="Region" class="p-1 px-2 w-full md:w-auto text-xs font-semibold bg-zinc-200 border border-zinc-400 rounded-lg placeholder:text-zinc-700 placeholder:text-opacity-70">{option}</select>
                    </div>
                    <div class="flex flex-col space-y-4">
                        {trend}
                    </div>
                </div>
            </div>
        </>;
    }
    async Build() {

        try {

            this.Set("{option}", <>
                <option value="false">Select Region</option>
            </>);

            for(var i = 0, len = Regions.length; i < len; i++) {

                this.Set("{option}++", <>
                    <option value={ Regions[i]["alpha-2"] }>{ Regions[i].name }</option>
                </>);

            };

        }
        catch(error) {
            alert(error);
            console.error(error);
        }

    }
    async Load() {

        try {

            this.Set("{trend}", "Loading...");

            const { Region } = this.element;
            const _region = (Region.value) ? `?region=${Region.value}` : "";
            
            const _response = await fetch(`/api/google/youtube/trending${_region}`);
            const { success, message, data } = await _response.json();

            if(!success || !_response.ok) {
                throw new Error(message);
            };

            this.Set("{trend}", "");

            for(var i = 0, len = data.length; i < len; i++) {

                const { kind, snippet, id, statistics } = data[i];
                if(!kind.includes("#video")) {
                    continue;
                };

                const { title, description, thumbnails: { high: { url } } } = snippet;
                const { commentCount, likeCount, viewCount } = statistics;

                this.Set("{trend}++", <>
                    <div class="flex flex-row space-x-2 border-b pb-3 border-zinc-400 border-opacity-50">
                        <div class="min-w-14 max-w-14 h-14 rounded-md bg-zinc-700 bg-no-repeat bg-center bg-cover" style={ `background-image: url(${ url });` }></div>
                        <div class="w-full flex flex-col space-y-1">
                            <a class="hover:underline text-xs font-semibold" target="_blank" href={ `https://www.youtube.com/watch?v=${id}` } rel="noopener noreferrer">{ title }</a>
                            <div class="text-xs" onclick={ (ev, el) => { el.innerText = description; } }>{ description }</div>
                            <div class="text-700 text-xs space-x-2 text-zinc-600 font-semibold">
                                <label><i class="fa fa-eye mr-1"></i>{ viewCount }</label>
                                <label><i class="fa fa-message mr-1"></i>{ commentCount }</label>
                                <label><i class="fa fa-thumbs-up mr-1"></i>{ likeCount }</label>
                            </div>
                        </div>
                    </div>
                </>);

            };

        }
        catch(error) {
            alert(error);
            console.error(error);
        };

    }
    Toggle(visible = true) {
        this.Set("{d.visible}", ((visible) ? "" : "hidden"));
    }
};