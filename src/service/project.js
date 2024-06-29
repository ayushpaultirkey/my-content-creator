import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { FFScene, FFCreator } from "ffcreator";

import delay from "../library/wait.js";
import directory from "../library/directory.js";

import Slide from "./slide.js";
import Gemini from "./google/gemini.js";
import Asset from "./asset.js";
import Scene from "./scene.js";


// Get directory path
const { __dirname } = directory();

// Store current project data
let PROJECT_ACTIVE_DATA = null;
let PROJECT_ACTIVE_ID = null;


//#region Render
/**
    * Render and save to project's export folder
    * @async
    * @param {*} projectId 
    * @param {*} project 
*/
async function Render(projectId = "", sse = null) {

    // Create new promise
    const _delay = new delay();

    //
    try {

        // Export name for file
        const _exportName = `${crypto.randomUUID()}.mp4`;

        // Get project
        const _project = await Project.GetActive(projectId);

        // Set ffmpeg path
        FFCreator.setFFmpegPath(path.join(__dirname, "./../../library/ffmpeg.exe"));
        FFCreator.setFFprobePath(path.join(__dirname, "./../../library/ffprobe.exe"));

        // Get project path
        const _projectPath = Project.Path(projectId);

        // Get slides
        const _property = _project.property;
        const _slides = _property.slides;

        // Set video dimension
        const W = _project.config.width * 1;
        const H = _project.config.height * 1;

        // Create new creator
        const _creator = new FFCreator({
            width: W,
            height: H
        });

        // Create new global scene
        const _scene = new FFScene();
        _scene.setBgColor("transparent");
        _scene.setDuration(_property.totalTime);
        _creator.addChild(_scene);

        // Add audio to background
        if(_project.backgroundAudio) {
            await Scene.AddAudio({
                projectId: projectId,
                scene: _scene,
                audio: _project.backgroundAudio,
                volume: 1,
                showAt: 0
            });
        };

        // Add image to background
        await Scene.AddImage({
            projectId: projectId,
            scene: _scene,
            image: _property.backgroundImage,
            totalTime: _property.totalTime,
            width: W,
            height: H,
            showAt: 0,
            hideAt: _property.totalTime
        });

        // Add video to background
        await Scene.AddVideo({
            projectId: projectId,
            scene: _scene,
            video: _property.backgroundVideo,
            totalTime: _property.totalTime,
            width: W,
            height: H,
            showAt: 0
        });

        // Render for all slides into separate files
        let _index = 0;
        let _length = _slides.length;

        // Create scenes and add it main creator
        const _build = async () => {

            // If index > total slides then finish
            if(_index > _length - 1) {
                console.log("Service/Project.Render(): All scenes builded and added in to creator");
                sse("Rendering: All Scenes builded");
                return;
            };

            // Get current slide by index
            const _slide = _slides[_index];

            // Add narration to scene
            await Scene.AddAudio({
                projectId: projectId,
                scene: _scene,
                audio: `${_slide.id}.wav`,
                volume: 1,
                showAt: _slide.showAt
            });
            
            // Add image to scene
            await Scene.AddImage({
                projectId: projectId,
                scene: _scene,
                image: _slide.image,
                totalTime: _slide.totalTime,
                width: W,
                height: H,
                showAt: _slide.showAt,
                hideAt: _slide.hideAt
            });

            // Add video to scene
            await Scene.AddVideo({
                projectId: projectId,
                scene: _scene,
                video: _slide.video,
                totalTime: _slide.totalTime,
                width: W,
                height: H,
                showAt: _slide.showAt
            });

            // Add main content to scene
            await Scene.AddText({
                projectId: projectId,
                scene: _scene,
                content: _slide.content,
                width: W,
                height: H,
                showAt: _slide.showAt,
                hideAt: _slide.hideAt
            });
            
            // Log
            console.log(`Service/Project.Render(): scene ${_slide.id} builded`);

            // Send SSE
            sse(`Rendering: Scene ${_index + 1} builded`);

            // Proceed to build next slide
            _index++;
            await _build();

        };

        // Build all slides
        await _build();

        // Start the rendering
        _creator.output(path.join(_projectPath, `./export/${_exportName}`));
        _creator.start();
        _creator.closeLog();
        
        // Register events
        _creator.on("start", () => {

            // Send SSE
            sse(`Rendering: Project rendering started`);

            // Log
            console.log(`Service/Project.Render(): Project render ${projectId} started`);
            
        });
        _creator.on("error", e => {
            
            // Send SSE
            sse(`Rendering: Error while rendering project`);

            // Log and reject
            console.log(`Service/Project.Render(): Unable to render project: ${projectId}`);
            _delay.reject(`Service/Project.Render(): Unable to render project: ${projectId}`);

        });
        _creator.on("progress", e => {

            // Send SSE
            sse(`Rendering: Project render status: ${(e.percent * 100) >> 0}%`);

            // Log
            console.log(`Service/Project.Render(): Project render: ${(e.percent * 100) >> 0}%`);

        });
        _creator.on("complete", e => {

            // Send SSE
            sse(`Rendering: Project render completed`);

            // Log and resolve
            console.log(`Service/Project.Render(): Project render ${projectId} completed`);
            _delay.resolve(_exportName);

        });

    }
    catch(error) {

        // Send SSE
        sse(`Rendering: Error while rendering project`);

        // Log and reject
        console.log("Service/Project.Render():", error);
        _delay.reject(error);
        
    }

    return _delay.promise;

};
//#endregion


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
        return (!PROJECT_ACTIVE_DATA || PROJECT_ACTIVE_DATA == null) ? undefined : PROJECT_ACTIVE_DATA;

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
            await fs.mkdir(path.join(_projectPath, "/export"), { recursive: true });
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


    //#region Update
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
    //#endregion


    //#region Save
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

    },
    //#endregion

};

export default { ... Project, Render };