import fs from "fs/promises";
import path from "path";

import directory from "../library/directory.js";

import Render from "./project/render.js";
import Create from "./project/create.js";
import Update from "./project/update.js";
import Export from "./project/export.js";

// Get directory path
const { __dirname, __root } = directory();

// Store current project data
let PROJECT_ACTIVE_DATA = null;
let PROJECT_ACTIVE_ID = null;

// Project object
const Project = {

    /**
        * @async
        * @param {string} projectId 
        * @returns {Promise<any | undefined>} 
    */
    GetActive: async function(projectId = "") {

        try {

            // Check if current project is empty or if th id match the current id
            if(!PROJECT_ACTIVE_DATA || PROJECT_ACTIVE_ID !== projectId) {
                return await this.SetActive(projectId);
            };

            // Log
            console.log("Service/Project.GetActive(): Project loaded from cache", projectId);

            // Return data
            return PROJECT_ACTIVE_DATA;

        }
        catch(error) {

            // Log and throw
            console.log("Service/Project.GetActive():", error);
            throw error;

        }

    },


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


    /**
        * 
        * @param {*} project 
    */
    UpdateActive: async function(project) {

        // Update cache and log
        PROJECT_ACTIVE_DATA = project;
        console.log("Service/Project/Update() Project cache updated");

    },


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

    
    /**
        * 
        * @param {string} projectId 
        * @returns {string}
    */
    Path: function(projectId = "") {

        // Check for project id
        if(typeof(projectId) !== "string") {
            throw new Error("Service/Project.Path(): Invalid project id");
        };

        // Get project path
        return path.join(__root, `/project/${projectId}/`);
    
    },


    /**
        * 
        * @param {*} projectId 
    */
    Save: async function(projectId = "") {

        // Try and save the project's cache
        try {

            // Check if the current project id match the args id
            if(projectId !== PROJECT_ACTIVE_ID) {
                throw new Error("Mismatch project id", projectId, PROJECT_ACTIVE_ID);
            };
            
            // Get project path and json data
            const _projectPath = path.join(this.Path(projectId), "/project.json");
            const _content = JSON.stringify(PROJECT_ACTIVE_DATA);

            // Write new data
            await fs.writeFile(_projectPath, _content);

            // Log
            console.log("Service/Project.Save(): Project data saved");

        }
        catch(error) {
            console.log("Service/Project.Save():", error);
            throw error;
        };

    },

};

export default { ... Project, Render, Create, Update, Export };