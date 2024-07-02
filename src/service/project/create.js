import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

import Slide from "./../slide.js";
import Asset from "./../asset.js";
import Project from "../project.js";
import Gemini from "./../google/gemini.js";


export default async function Create({prompt, file, width = 128, height = 128}, callback) {

    // Log
    console.log("Service/Project/Create(): Project creation started");

    // Try and create project
    try {

        // Generate random project id
        const _projectId = crypto.randomUUID();

        // Check if the folder already exist
        if(await Project.Exist(_projectId)) {
            throw new Error("Project already exists");
        };
        
        // Build cat history and check for file
        let _history = [];
        if(file) {

            // Log
            console.log("Service/Project/Create(): File found, adding multimodel prompt");
            callback("Project: Creating multi model prompt");

            // Create prompt with file
            await Gemini.PromptFile(file, _history);

        };

        // Log
        console.log("Service/Project/Create(): Prompt started");
        callback("Project: Generating response");

        // Start main prompt
        const _answer = await Gemini.Prompt(prompt, _history);
        const _project = {
            config: {
                width: width * 1,
                height: height * 1
            },
            property: _answer.response,
            history: _history,
        };

        // Log
        console.log("Service/Project/Create(): Prompt ended");
        callback("Project: Creating project");

        // Create new project folder and json file
        const _projectPath = Project.Path(_projectId);
        await fs.mkdir(_projectPath, { recursive: true });
        await fs.mkdir(path.join(_projectPath, "/asset"), { recursive: true });
        await fs.mkdir(path.join(_projectPath, "/cache"), { recursive: true });
        await fs.writeFile(path.join(_projectPath, "/project.json"), JSON.stringify(_project));

        // Create voide and render out the slides
        await Asset.GetExternalAsset(_projectId, _project, callback);
        await Asset.CreateVoiceAsset(_projectId, _project.property.slides, true, callback);
        await Slide.Render(_projectId, null, callback);

        // Log
        console.log("Service/Project/Create(): Project created", _projectId);
        callback("Project: Project created");

        // Return project data with project id
        return { ... _project, id: _projectId };

    }
    catch(error) {
        console.log("Service/Project/Create():", error);
        throw error;
    };

}