import "@style/main.css";
import H12 from "@library/h12";
import Dispatcher from "@library/h12.dispatcher";
import MyCreator from "@library/mycreator";

@Component
export default class Youtube extends H12 {

    constructor() {
        super();
        this.Project = null;
        this.Categories = [
            { id: "1", value: "Film & Animation" },
            { id: "2", value: "Autos & Vehicles" },
            { id: "10", value: "Music" },
            { id: "15", value: "Pets & Animals" },
            { id: "17", value: "Sports" },
            { id: "18", value: "Short Movies" },
            { id: "19", value: "Travel & Events" },
            { id: "20", value: "Gaming" },
            { id: "21", value: "Videoblogging" },
            { id: "22", value: "People & Blogs" },
            { id: "23", value: "Comedy" },
            { id: "24", value: "Entertainment" },
            { id: "25", value: "News & Politics" },
            { id: "26", value: "Howto & Style" },
            { id: "27", value: "Education" },
            { id: "28", value: "Science & Technology" },
            { id: "29", value: "Nonprofits & Activism" },
            { id: "30", value: "Movies" },
            { id: "31", value: "Anime/Animation" },
            { id: "32", value: "Action/Adventure" },
            { id: "33", value: "Classics" },
            { id: "34", value: "Comedy" },
            { id: "35", value: "Documentary" },
            { id: "36", value: "Drama" },
            { id: "37", value: "Family" },
            { id: "38", value: "Foreign" },
            { id: "39", value: "Horror" },
            { id: "40", value: "Sci-Fi/Fantasy" },
            { id: "41", value: "Thriller" },
            { id: "42", value: "Shorts" },
            { id: "43", value: "Shows" },
            { id: "44", value: "Trailers" }
        ];
    }

    async init(args = { project }) {

        // Create video category
        this.Set("{y.option}", "");
        for(var x in this.Categories) {
            this.Set("{y.option}++", <>
                <option value={ this.Categories[x].id }>{ this.Categories[x].value }</option>
            </>);
        };
        this.element.YTCategory.value = 24;

        // Check if project is valid and store it
        if(args.project) {
            this.Project = args.project;
        };

    }

    async render() {
        return <>
            <div class="absolute top-0 left-0 w-full h-full bg-zinc-900 text-zinc-800 bg-opacity-90 flex justify-center items-center collapse">
                    
                <div class="w-full bg-zinc-200 p-6 space-y-5">
                    <div class="flex items-center space-x-3 text-zinc-800">
                        <i class="fa-brands fa-youtube text-2xl text-red-500"></i>
                        <label class="font-semibold w-full">Youtube Upload</label>
                    </div>
                    <div class="flex flex-col space-y-1">
                        <label class="text-xs font-semibold text-zinc-900">Title:</label>
                        <input type="text" class="block md:w-96 w-full text-xs font-semibold bg-zinc-300 border border-zinc-400 p-2 rounded-md placeholder:text-zinc-600 text-zinc-800" placeholder="Project's title" id="YTTitle" />
                    </div>
                    <div class="flex flex-col space-y-1">
                        <label class="text-xs font-semibold text-zinc-900">Title:</label>
                        <textarea class="block md:w-96 w-full h-20 text-xs font-semibold bg-zinc-300 border border-zinc-400 p-2 rounded-md placeholder:text-zinc-600 text-zinc-800 resize-none" placeholder="Project's description" id="YTDescription"></textarea>
                    </div>
                    <div class="flex flex-col space-y-1">
                        <label class="text-xs font-semibold text-zinc-900">Categories:</label>
                        <select class="block md:w-96 w-full text-xs font-semibold bg-zinc-300 border border-zinc-400 p-2 rounded-md placeholder:text-zinc-600 text-zinc-800" id="YTCategory">{y.option}</select>
                    </div>
                    <div class="space-x-2">
                        <button class="p-2 px-6 text-xs text-blue-100 font-semibold rounded-md bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors" id="YTUpload" onclick={ this.#Upload }><i class="fa fa-upload mr-2"></i>Upload</button>
                        <button class="p-2 px-6 text-xs text-zinc-300 font-semibold rounded-md bg-zinc-600 hover:bg-zinc-700 active:bg-zinc-800 transition-colors" onclick={ this.Hide }><i class="fa fa-xmark mr-2"></i>Cancel</button>
                    </div>
                </div>

            </div>
        </>;
    }

    Show() {
        this.root.classList.remove("collapse");
        this.Load();
    }

    Hide() {
        this.root.classList.add("collapse");
    }

    Load() {

        if(!this.Project) {
            return false;
        };

        const _property = this.Project.property;

        this.element.YTTitle.value = _property.title;
        this.element.YTDescription.value = _property.description;

    }

    async #Upload() {

        // Check if the project is valid
        if(!this.Project) {
            return false;
        };

        try {

            // Get values and check it
            const _category = this.element.YTCategory.value;
            const _title = encodeURIComponent(this.element.YTTitle.value);
            const _description = encodeURIComponent(this.element.YTDescription.value);
            if(_title.length < 2 || _description.length < 2) {
                throw new Error("Please enter title and description")
            };

            // Disable button
            this.element.YTUpload.disabled = true;

            // Register new server send event
            const _source = new EventSource(`/api/project/export/youtube?pid=${this.Project.id}&t=${_title}&d=${_description}&c=${_category}`);         
            _source.onopen = () => { Dispatcher.Call("OnLoaderShow"); }
            _source.onmessage = (event) => {

                // Try and get response
                try {

                    // Get response data and check if success and finished
                    const _data = JSON.parse(event.data.split("data:"));
                    if(!_data.success) {
                        throw new Error(_data.message);
                    };

                    // Check if the file is uploaded
                    if(_data.finished) {
                        alert("File uploaded to youtube !");
                    };

                    // Call dispather show loader
                    Dispatcher.Call("OnLoaderUpdate", _data.message);

                }
                catch(error) {

                    // Alert, hide loader and enable button
                    alert(error);
                    Dispatcher.Call("OnLoaderHide");
                    this.element.YTUpload.disabled = false;
                    _source.close();

                };
            };
            _source.onerror = () => {

                // Hide loader and enable button on error
                Dispatcher.Call("OnLoaderHide");
                this.element.YTUpload.disabled = false;
                _source.close();

            };

        }
        catch(error) {

            // Alert and log
            alert("Unable to render project, try again later");
            console.error("Editor/Project.Youtube():", error);
            this.element.YTUpload.disabled = false;
            
        };

    }


};