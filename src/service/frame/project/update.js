import Slide from "../slide.js";
import Asset from "../../asset.js";
import Project from "../project.js";
import Read from "./read.js";
import Path from "./path.js";
import Save from "./save.js";
import Config from "./../@config.js";
import Gemini from "../../google/gemini.js";
import fs from "fs/promises";
import path from "path";


async function ValidateSlideAsset(projectId, firstSlide, newSlide = []) {

    try {

        const _projectPath = Path(projectId);

        if(!firstSlide || !firstSlide.image || !firstSlide.image[0].name) {
            throw new Error("Invalid first slide");
        };

        for(var i = 0, len = newSlide.length; i < len; i++) {
                
            if(!newSlide[i].image || !newSlide[i].image[0] || !newSlide[i].image[0].name) {
                continue;
            };

            const _oPath = path.join(_projectPath, "/asset/", firstSlide.image[0].name);
            const _nPath = path.join(_projectPath, "/asset/", newSlide[i].image[0].name);

            await fs.copyFile(_oPath, _nPath);

            //
            console.log(`S/F/Project/Update.ValidateSlideAsset(): New asset created for slide ${newSlide[i].id}`);
            
        };
    }
    catch(error) {
        console.log("S/F/Project/Update.ValidateSlideAsset():", error);
    };

};


export default async function Update({ projectId = "", prompt = "", file = null, callback }) {

    //
    console.log("S/F/Project/Update(): Project update started");

    //
    try {

        //
        if(!prompt && !file) {
            throw new Error("S/F/Project/Update(): Expecting either prompt or file.");
        };
    
        //
        const _project = await Read(projectId);
        const _projectPath = Path(projectId);
        let _history = _project.history;
        
        //
        if(file) {
            console.log("S/F/Project/Update(): File found, adding multimodel prompt");
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
                await ValidateSlideAsset(projectId, _project.property.slides[0], _slide.added);
            }
            catch(error) {
                console.log("S/F/Project/Update():", error);
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
        await Project.Save(projectId, _projectUpdated);

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
        console.log("S/F/Project/Update(): Project update ended");


        // Return new project
        return _projectUpdated;

    }
    catch(error) {
        console.log("S/F/Project/Update():", error);
        throw error;
    };
    
};