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


async function ValidateNewSlide(projectId, firstSlide, newSlide = []) {

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
            console.log(`Service/Project/Update.ValidateNewSlide(): New asset created for slide ${newSlide[i].id}`);
            
        };
    }
    catch(error) {
        console.log("Service/Project/Update.ValidateNewSlide():", error);
    };

};


export default async function Update({ projectId = "", prompt = "", file = null }) {

    //
    console.log("Service/Project/Update(): Project update started");

    //
    try {

        //
        if(!prompt && !file) {
            throw new Error("Service/Project/Update(): Expecting either prompt or file.");
        };
    
        //
        let _project = await Read(projectId);
        let _projectPath = Path(projectId);
        let _history = _project.history;
        
        //
        if(file) {
            console.log("Service/Project/Update(): File found, adding multimodel prompt");
            await Gemini.PromptFile(Config.E_GEMINI, file, _history);
        };

        //
        const _answer = await Gemini.Prompt(Config.E_GEMINI, prompt, _history);
        
        //
        const _slide = Slide.Modified(_project.property.slides, _answer.response.slides);

        //
        if(_slide.added.length > 0) {

            try {
                await ValidateNewSlide(projectId, _project.property.slides[0], _slide.added);
            }
            catch(error) {
                console.log("Service/Project/Update():", error);
            };

        };

        const _slideUpdated = _slide.updated.concat(_slide.added);

        //
        const _projectUpdated = {
            config: { ... _project.config },
            property: { ... _answer.response },
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
        console.log("Service/Project/Update(): Project update ended");


        // Return new project
        return _projectUpdated;

    }
    catch(error) {
        console.log("Service/Project/Update():", error);
        throw error;
    };
    
};