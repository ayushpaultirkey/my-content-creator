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

    console.log(chalk.green("/S/Frame/Project/Update(): Project update started"));

    try {

        // Check if the prompt and the files is valid and then
        // get the project data
        if(!prompt && !file) {
            throw new Error("Expecting either prompt or file.");
        };
    
        const _project = await Read(projectId);
        const _projectPath = Path(projectId);
        let _history = _project.history;
        
        // Use multimodel of the files is valid
        if(file) {

            console.log(chalk.green("/S/Frame/Project/Update():"), "File found, adding multimodel prompt");
            await Gemini.PromptFile(Config.E_GEMINI, file, _history);

        };
        callback("Project: AI is updating project data");

        // Generate response
        const _response = await Gemini.Prompt(Config.E_GEMINI, prompt, _history);
        const _parsed = JSON.parse(_response.answer);
        const _slide = Slide.Modified(_project.property.slides, _parsed.slides);

        // Check if any new slides is added
        if(_slide.added.length > 0) {

            try {
                await Slide.ValidateAsset(projectId, _project.property.slides[0], _slide.added);
            }
            catch(error) {
                console.log(chalk.red("/S/Frame/Project/Update():"), error);
            };

        };

        // Get all updated slides and
        // update the project
        const _slideUpdated = _slide.updated.concat(_slide.added);

        const _projectUpdated = {
            config: { ... _project.config },
            property: _parsed,
            history: _history
        };

        // Save the new project
        await Save(projectId, _projectUpdated);

        // Create new narration files for the
        // project in its directory
        await Asset.CreateVoiceAsset({
            content: _slideUpdated.map(x => ({
                text: x.content,
                destination: path.join(_projectPath, `/asset/${x.id}.mp3`)
            })),
            callback: callback,
        });

        // Start the rendering of those new slides
        await Slide.Render({
            slide: _slideUpdated,
            root: _projectPath,
            width: _project.config.width,
            height: _project.config.height,
            callback: callback
        });

        // Log
        console.log(chalk.green("/S/Frame/Project/Update():"), "Project update ended");

        // Return new project
        return _projectUpdated;

    }
    catch(error) {
        console.log(chalk.red("/S/Frame/Project/Update():"), error);
        throw new Error("Unable to update project");
    };
    
};