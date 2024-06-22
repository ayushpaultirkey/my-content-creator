import path from "path";
import fs from "fs/promises";

import { RenderSlide } from "./slide.js";
import { GenerativeRun } from "./gemini.js";
import { CreateVoice, FetchExternalAsset } from "./asset.js";
import directory from "../../library/directory.js";


/**
    * 
    * @param {string} projectId 
    * @returns 
    */
function GetProjectPath(projectId = "") {

    // Get current directory path
    const { __dirname } = directory();

    // Get project path
    return path.join(__dirname, `../../public/project/${projectId}/`);

};


/**
    * 
    * @param {string} projectId 
    * @returns 
*/
async function ReadProject(projectId = "") {

    try {

        // Get project path and read the project json file
        const _projectPath = path.join(GetProjectPath(projectId), "/project.json");
        const _content = await fs.readFile(_projectPath, "utf8");

        // Parse json
        const _json = JSON.parse(_content);

        // Export the json file
        return _json;

    }
    catch(error) {
        console.log("ReadProject():", error);
        throw error;
    };

};


/**
    * 
    * @param {string} projectId 
    * @param {string} project 
*/
async function SaveProject(projectId = "", project = {}) {

    try {
        
        // Get project path and json data
        const _projectPath = path.join(GetProjectPath(projectId), "/project.json");
        const _content = JSON.stringify(project);

        // Write new data
        await fs.writeFile(_projectPath, _content);

    }
    catch(error) {
        console.log("SaveProject():", error);
        throw error;
    };

};


/**
    * 
    * @param {string} projectId 
    * @param {string} prompt 
    * @returns 
*/
async function UpdateProject(projectId = "", prompt = "") {

    try {
        
        // Get project data
        const _project = await ReadProject(projectId);
        
        // Generative run
        const _answer = await GenerativeRun(prompt, _project.session.context);

        // Create updated project
        const _projectUpdated = {
            config: { ... _project.config },
            property: { ... _answer.response },
            session: {
                "context": _answer.context
            }
        };

        // Update project file
        await SaveProject(projectId, _projectUpdated);

        // Return new project
        return _projectUpdated;

    }
    catch(error) {
        throw error;
    }

}


/**
    * 
    * @param {string} projectId 
    * @returns 
*/
async function DoesProjectExist(projectId = "") {

    try {

        // Check if the project file exists ?
        const _projectPath = path.join(GetProjectPath(projectId), "/project.json");
        await fs.access(_projectPath);

        return true;
        
    }
    catch(error) {
        if(error.code === "ENOENT") {
            return false;
        }
        else {
            console.log("DoesProjectExist():", error);
            throw error;
        };
    };

};


/**
    * 
    * @param {string} projectId 
    * @param {string} prompt 
    * @param {number} width 
    * @param {number} height 
    * @returns 
*/
async function CreateProject(prompt = "", width = 720, height = 1280) {

    try {

        // Generate random id
        const _projectId = crypto.randomUUID();

        // Check if the folder already exist
        if(await DoesProjectExist(_projectId)) {
            throw new Error("Project already exists");
        };

        // Generative run project prompt
        const _answer = await GenerativeRun(prompt);
        const _project = {
            config: {
                width: width * 1,
                height: height * 1
            },
            property: _answer.response,
            session: {
                context: _answer.context
            }
        };

        // Create new project folder and json file
        const _projectPath = GetProjectPath(_projectId);
        await fs.mkdir(_projectPath, { recursive: true });
        await fs.mkdir(path.join(_projectPath, "/asset"), { recursive: true });
        await fs.mkdir(path.join(_projectPath, "/cache"), { recursive: true });
        await fs.writeFile(path.join(_projectPath, "/project.json"), JSON.stringify(_project));

        // Create voide and render out the slides
        await FetchExternalAsset(_projectId, _project);
        await CreateVoice(_projectId, _project.property.slides);
        await RenderSlide(_projectId, _project.property.slides, _project);

        // Return newly created project
        return { ... _project, id: _projectId };

    }
    catch(error) {
        console.log("CreateProject():", error);
        throw error;
    };

};


export { ReadProject, CreateProject, UpdateProject, DoesProjectExist, SaveProject, GetProjectPath };