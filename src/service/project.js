import fs from "fs/promises";
import path from "path";

import directory from "../library/directory.js";

import Slide from "./slide.js";
import Gemini from "./google/gemini.js";
import Asset from "./asset.js";


// Get directory path
const { __dirname } = directory();

// Store current project data
let PROJECT_ACTIVE_DATA = null;
let PROJECT_ACTIVE_ID = null;


// Project object
const Project = {

    //#region GetActive
    /**
        * @async
        * @param {string} projectId 
        * @returns {Promise<any | undefined>} 
    */
    GetActive: async function(projectId = "") {

        //
        if(PROJECT_ACTIVE_DATA == null || PROJECT_ACTIVE_ID !== projectId) {
            return await this.SetActive(projectId);
        };

        //
        console.log("Service/Project.GetActive(): Project loaded from cache", projectId);

        //
        return (PROJECT_ACTIVE_DATA || PROJECT_ACTIVE_DATA == null) ? undefined : PROJECT_ACTIVE_DATA;

    },
    //#endregion


    //#region SetActive
    /**
        * 
        * @async
        * @param {string} projectId 
        * @returns {Promise<any | undefined>}
    */
    SetActive: async function(projectId = "") {
        
        try {

            //
            const _project = await this.Read(projectId);

            //
            PROJECT_ACTIVE_ID = projectId;
            PROJECT_ACTIVE_DATA = _project;

            //
            console.log("Service/Project.SetActive(): New project set to active", projectId);

            //
            return _project;

        }
        catch(error) {
            console.log("Service/Project.SetActive():", error);
            throw error;
        }

    },
    //#endregion


    //#region Read
    /**
        * 
        * @async
        * @param {string} projectId 
        * @returns {Promise<any | undefined>}
    */
    Read: async function(projectId = "") {

        try {

            // Get project path and read the project json file
            const _projectPath = path.join(this.Path(projectId), "/project.json");
            const _content = await fs.readFile(_projectPath, "utf8");
    
            // Parse json
            const _json = JSON.parse(_content);
    
            // Export the json file
            return _json;
    
        }
        catch(error) {
            console.log("Service/Project.Read():", error);
            throw error;
        };

    },
    //#endregion


    //#region Exist
    /**
        * 
        * @async
        * @param {string} projectId 
        * @returns {Promise<boolean>}
    */
    Exist: async function(projectId = "") {

        try {
    
            // Check if the project file exists ?
            const _projectPath = path.join(this.Path(projectId), "/project.json");
            await fs.access(_projectPath);
    
            return true;
            
        }
        catch(error) {
            if(error.code === "ENOENT") {
                return false;
            }
            else {
                console.log("Service/Project.Exist():", error);
                throw error;
            };
        };
    
    },
    //#endregion


    //#region Path
    /**
        * 
        * @param {string} projectId 
        * @returns {string}
    */
    Path: function(projectId = "") {

        // Get project path
        return path.join(__dirname, `../../project/${projectId}/`);
    
    },
    //#endregion


    //#region Create
    Create: async function(prompt, file, width = 128, height = 128) {

        // Log
        console.log("Service/Project/CreateProject(): Project creation started");

        // Try and create project
        try {

            // Generate random project id
            const _projectId = crypto.randomUUID();

            // Check if the folder already exist
            if(await this.Exist(_projectId)) {
                throw new Error("Project already exists");
            };
            
            // Build cat history and check for file
            let _history = [];
            if(file !== null && !file) {
                console.log("Service/Project.Create(): File found");
                await Gemini.PromptFile(file, _history);
            };

            // Start prompt
            console.log("Service/Project.Create(): Prompt started");
            const _answer = await Gemini.Prompt(prompt, _history);
            const _project = {
                config: {
                    width: width * 1,
                    height: height * 1
                },
                property: _answer.response,
                history: _history
            };

            // Create new project folder and json file
            const _projectPath = this.Path(_projectId);
            await fs.mkdir(_projectPath, { recursive: true });
            await fs.mkdir(path.join(_projectPath, "/asset"), { recursive: true });
            await fs.mkdir(path.join(_projectPath, "/cache"), { recursive: true });
            await fs.writeFile(path.join(_projectPath, "/project.json"), JSON.stringify(_project));

            // Create voide and render out the slides
            await Asset.GetExternalAsset(_projectId, _project);
            await Asset.CreateVoiceAsset(_projectId, _project.property.slides);
            await Slide.Render(_projectId, _project);

            // Log
            console.log("Service/Project.Create(): Project created", _projectId);

            // Return project data with project id
            return { ... _project, id: _projectId };

        }
        catch(error) {
            console.log("Service/Project.Create():", error);
            throw error;
        };

    },
    //#endregion

    Update: async function(projectId = "", prompt = "") {


        try {
        
            // Get project data
            const _project = await this.GetActive(projectId);
            
            // Generative run
            const _answer = await Gemini.Prompt(prompt, _project.history);
            
            // Create updated project
            const _projectUpdated = {
                config: { ... _project.config },
                property: { ... _answer.response },
                history: _answer.history
            };

            // Update active project
            PROJECT_ACTIVE_DATA = _projectUpdated;
    
            // Update project file
            await this.Save(projectId, _projectUpdated);
    
            // Return new project
            return _projectUpdated;
    
        }
        catch(error) {
            console.log("Service/Project.Update():", error);
            throw error;
        };


    },

    Save: async function(projectId = "") {

        try {

            if(projectId !== PROJECT_ACTIVE_ID) {
                throw new Error("Mismatch project id", projectId, PROJECT_ACTIVE_ID);
            };
            
            // Get project path and json data
            const _projectPath = path.join(this.Path(projectId), "/project.json");
            const _content = JSON.stringify(PROJECT_ACTIVE_DATA);

            // Write new data
            await fs.writeFile(_projectPath, _content);

        }
        catch(error) {
            console.log("Service/Project.Save():", error);
            throw error;
        };

    }

}

export default Project;