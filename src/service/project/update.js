import Slide from "./../slide.js";
import Asset from "./../asset.js";
import Project from "../project.js";
import Gemini from "./../google/gemini.js";
import fs from "fs/promises";
import path from "path";


async function ValidateNewSlide(projectId, firstSlide, newSlide = []) {

    try {

        const _projectPath = Project.Path(projectId);

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


export default async function Update(projectId = "", prompt = "", file = null) {

    // Log
    console.log("Service/Project/Update(): Project update started");

    // Try and update project
    try {

        // Check if prompt or file is valid
        if(!prompt && !file) {
            throw new Error("Service/Project/Update(): Expecting either prompt or file.");
        };
    
        // Get project data and history for prompting
        const _project = await Project.GetActive(projectId);
        const _history = _project.history;
        
        // Check if file is valid then use multi model prompt
        if(file) {
            console.log("Service/Project/Update(): File found, adding multimodel prompt");
            await Gemini.PromptFile(file, _history);
        };

        // Generative run
        const _answer = await Gemini.Prompt(prompt, _history);
        
        // Get modified slides to render only those
        const _slide = Slide.CompareModified(_project.property.slides, _answer.response.slides);

        // Check if any slide is added and update the image
        if(_slide.added.length > 0) {

            try {
                await ValidateNewSlide(projectId, _project.property.slides[0], _slide.added);
            }
            catch(error) {
                console.log("Service/Project/Update():", error);
            };

        };

        const _slideUpdated = _slide.updated.concat(_slide.added);

        // Create updated project
        const _projectUpdated = {
            config: { ... _project.config },
            property: { ... _answer.response },
            history: _history
        };

        // Update active project
        Project.UpdateActive(_projectUpdated);

        // Create audio and render the slides
        await Asset.CreateVoiceAsset(projectId, _slideUpdated);
        await Slide.Render(projectId, _slideUpdated);

        // Log
        console.log("Service/Project/Update(): Project update ended");

        // Update project file
        await Project.Save(projectId, _projectUpdated);

        // Return new project
        return _projectUpdated;

    }
    catch(error) {
        console.log("Service/Project/Update():", error);
        throw error;
    };
    
};