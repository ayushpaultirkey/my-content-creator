import path from "path";
import fs from "fs/promises";
import wait from "./wait.js";
import { FFScene, FFText, FFImage, FFCreator, FFAudio, FFRect } from "ffcreator";

import directory from "../../library/directory.js";
import { RenderSlide } from "./slide.js";
import { CreateVoice } from "./asset.js";
import { GenerativeRun } from "./gemini.js";


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
async function UpdateProjectX(projectId = "", prompt = "") {

    try {
        
        // Get project data
        const _project = await ReadProject(projectId);
        
        // Generative run
        const _answer = await GenerativeRun(prompt, _project.session.context);

        // Create updated project
        const _projectUpdated = {
            "config": { ... _project.config },
            "property": { ... _answer.response },
            "session": {
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
                width: width,
                height: height
            },
            property: _answer.response,
            session: { context: _answer.context }
        };

        // Create new project folder and json file
        const _projectPath = GetProjectPath(_projectId);
        await fs.mkdir(_projectPath, { recursive: true });
        await fs.mkdir(path.join(_projectPath, "/asset"), { recursive: true });
        await fs.mkdir(path.join(_projectPath, "/cache"), { recursive: true });
        await fs.writeFile(path.join(_projectPath, "/project.json"), JSON.stringify(_project));

        // Create voide and render out the slides
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






async function UpdateProject(projectId = "", project = {}) {

    try {
        
        // Get project path and json data
        const _path = path.join(GetProjectPath(projectId), "/project.json");
        const _content = JSON.stringify(project);

        // Write new data
        await fs.writeFile(_path, _content);

    }
    catch (error) {

        throw new Error("Failed to update project file");

    };

};
async function DoesProjectExists(projectId = "") {

    try {

        // Get current directory path
        const { __dirname } = directory();

        // Check if the project file exists ?
        const _path = path.join(__dirname, `../../public/project/${projectId}/project.json`);
        await fs.access(_path);

        return true;
        
    }
    catch(error) {
        if(error.code === "ENOENT") {
        }
        else {
            throw error;
        };
    };

};
async function readProject(projectId = "") {
    try {
        
        // Get current directory path and filename
        const { __dirname } = directory();

        const projectPath = path.join(__dirname, `../../public/project/${projectId}/project.json`);

        const content = await fs.readFile(projectPath, "utf8");

        return JSON.parse(content);

    }
    catch (error) {
        throw new Error(`Failed to read or parse json file`);
    };
};
async function doesProjectExist(projectId = "") {
    try {

        // Get current directory path and filename
        const { __dirname } = directory();

        const projectPath = path.join(__dirname, `../../public/project/${projectId}/project.json`);

        await fs.access(projectPath);

        return true;
        
    }
    catch(error) {
        if(error.code === "ENOENT") {
            return false;
        }
        else {
            throw error;
        };
    };
};
async function projectSlideRender(projectId = "", slides = []) {

    // Create new promise
    const sleep = new wait();

    //
    try {

        // Get current directory path and filename
        const { __dirname } = directory();
        FFCreator.setFFmpegPath(path.join(__dirname, "./../../library/ffmpeg/bin/ffmpeg.exe"));
        FFCreator.setFFprobePath(path.join(__dirname, "./../../library/ffmpeg/bin/ffprobe.exe"));

        // Get project path
        const projectPath = path.join(__dirname, `../../public/project/${projectId}`);

        // Set video dimension
        const S = 1;
        const W = 720 / S;
        const H = 1280 / S;

        // Render for all slides into separate files
        let index = 0;
        let length = slides.length;
        const render = () => {
        
            if(index > length - 1) {

                console.log("Project pre-render completed");
                sleep.resolve("Project pre-render completed");

            }
            else {

                //
                const slide = slides[index];

                //
                const creator = new FFCreator({
                    width: W,
                    height: H
                });
                    
                //
                const scene = new FFScene();
                scene.setBgColor("#000000");
                scene.setDuration(slide.time);
                scene.setTransition("GridFlip", 2);
                creator.addChild(scene);

                const rectangle = new FFRect({ width: W * 2, height: H * 2, color: "#FF0000" });
                rectangle.addEffect("fadeIn", 1, 0);
                rectangle.addEffect("fadeOut", 1, slide.hideAt - slide.showAt);
                scene.addChild(rectangle);

                //
                const text = new FFText({
                    text: slide.content,
                    x: W / 2,
                    y: H / 2,
                });
                text.setColor("#ffffff");
                text.addEffect("zoomIn", 1, 0);
                text.addEffect("fadeOut", 1, slide.hideAt - slide.showAt);
                text.alignCenter();
                text.setWrap(W / 1.5);
                scene.addChild(text);

                //
                creator.output(path.join(projectPath, `./cache/${slide.id}.mp4`));
                creator.start();
                creator.closeLog();

                //
                console.log(path.join(projectPath, `./cache/${slide.id}.mp4`))

                //
                creator.on("start", () => {
                    console.log(`Project pre-render started`);
                });
                creator.on("error", e => {
                    console.log(`Unable to pre-render project`);
                    sleep.reject("Unable to pre-render project");
                });
                creator.on("progress", e => {
                    console.log(`Project pre-render: ${(e.percent * 100) >> 0}%`);
                });
                creator.on("complete", e => {
                    console.log(`Project pre-render ${slide.id} completed`);
                    index++;
                    render();
                });

            };

        };
    
        render();

    }
    catch(error) {
        sleep.reject(error);
    }

    return sleep.promise;

};



export { readProject, doesProjectExist, projectSlideRender, ReadProject, CreateProject, UpdateProject, UpdateProjectX, DoesProjectExists, SaveProject, GetProjectPath };
