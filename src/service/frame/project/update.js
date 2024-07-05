import path from "path";
import chalk from "chalk";

import Asset from "../../asset.js";
import Gemini from "../../google/gemini.js";

import Config from "../@config.js";
import Slide from "../slide.js";
import Read from "./read.js";
import Path from "./path.js";
import Save from "./save.js";

export default async function Update({ projectId = "", prompt = "", file = null, callback }) {

    //
    console.log(chalk.green("S/Frame/Project/Update(): Project update started"));

    //
    try {

        //
        if(!prompt && !file) {
            throw new Error("Expecting either prompt or file.");
        };
    
        //
        const _project = await Read(projectId);
        const _projectPath = Path(projectId);
        let _history = _project.history;
        
        //
        if(file) {

            console.log(chalk.green("S/Frame/Project/Update():"), "File found, adding multimodel prompt");
            await Gemini.PromptFile(Config.E_GEMINI, file, _history);

        };

        //
        callback("Project: AI is updating project data");

        //
        const _response = await Gemini.Prompt(Config.E_GEMINI, prompt, _history);
        const _parsed = JSON.parse(_response.answer);
        const _slide = Slide.Modified(_project.property.slides, _parsed.slides);

        //
        if(_slide.added.length > 0) {

            try {
                await Slide.ValidateAsset(projectId, _project.property.slides[0], _slide.added);
            }
            catch(error) {
                console.log(chalk.red("S/Frame/Project/Update():"), error);
            };

        };

        const _slideUpdated = _slide.updated.concat(_slide.added);

        //
        const _projectUpdated = {
            config: { ... _project.config },
            property: _parsed,
            history: _history
        };

        //
        await Save(projectId, _projectUpdated);

        //
        await Asset.CreateVoiceAsset({
            content: _slideUpdated.map(x => ({
                text: x.content,
                destination: path.join(_projectPath, `/asset/${x.id}.wav`)
            })),
            callback: callback,
            useLocalTTS: true,
        });

        //
        await Slide.Render({
            slide: _slideUpdated,
            root: _projectPath,
            width: _project.config.width,
            height: _project.config.height,
            callback: callback
        });

        // Log
        console.log(chalk.green("S/Frame/Project/Update():"), "Project update ended");

        // Return new project
        return _projectUpdated;

    }
    catch(error) {
        console.log(chalk.red("S/Frame/Project/Update():"), error);
        throw error;
    };
    
};