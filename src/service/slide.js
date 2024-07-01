import path from "path";
import fs from "fs/promises";
import { FFScene, FFText, FFCreator, FFAlbum, FFVideo } from "ffcreator";

import delay from "../library/wait.js";
import directory from "../library/directory.js";

import Asset from "./asset.js";
import Gemini from "./google/gemini.js";

import Scene from "./scene.js";
import Project from "./project.js";
import GetUpdatedSlide from "./slide/getUpdatedSlide.js";

// Get current directory path and filename
const { __dirname } = directory();

function CompareModified(originalSlides = [], newSlides = []) {

    // Create object to store updated slides
    const _update = { updated: [], removed: [], added: [] };
    
    // Create original map for the slides
    const _originalMap = new Map(originalSlides.map(slide => [slide.id, slide]));

    // Check for any updates and additions
    newSlides.forEach(newSlide => {

        const _originalSlide = _originalMap.get(newSlide.id);
        if(_originalSlide) {

            // Check if content has changed
            if(JSON.stringify(_originalSlide) !== JSON.stringify(newSlide)) {
                _update.updated.push(newSlide);
            };

            // Remove from map to keep track of remaining slides
            _originalMap.delete(newSlide.id);

        }
        else {
            _update.added.push(newSlide);
        };

    });

    // Remaining slides in originalMap are considered removed
    _update.removed = Array.from(_originalMap.values());

    return _update;

}

async function Update(projectId = "", prompt = "", file = null) {

    try {

        // // Get project data
        // const _project = await Project.GetActive(projectId);
        // const _history = _project.history;

        // // Check for file
        // if(file !== null) {
        //     console.log("Service/Slide.Update(): File found");
        //     await Gemini.PromptFile(file, _history);
        // };

        // Generative run
        const _answer = await Gemini.Prompt(prompt, _history);

        // Update the project data
        // const _answers = await Project.Update(projectId, prompt);

        // Get updated slides
        const _slide = GetUpdatedSlide(_project.property.slides, _answer.response.slides);
        const _slideUpdated = _slide.updated.concat(_slide.added);

        // Create updated project
        const _projectUpdated = {
            config: { ... _project.config },
            property: { ... _answer.response },
            history: _history
        };

        // Update the project data
        await Project.Update(projectId, _projectUpdated);

        // Create audio and render the slides
        await Asset.CreateVoiceAsset(projectId);
        await Render(projectId);


        // Return new project
        return _projectUpdated;

    }
    catch(error) {
        console.log("Service/Slide.Update():", error);
        throw error;
    }

};


async function Render(projectId = "", slide = null, sse = null) {

    // Create new promise
    const _delay = new delay();

    //
    try {

        // Set ffmpeg path
        FFCreator.setFFmpegPath(path.join(__dirname, "./../../library/ffmpeg.exe"));
        FFCreator.setFFprobePath(path.join(__dirname, "./../../library/ffprobe.exe"));

        // Get project data, path and slides
        const _project = await Project.GetActive(projectId);
        const _projectPath = Project.Path(projectId);
        const _slides = (!slide) ? _project.property.slides : slide;

        // Set video dimension
        const W = _project.config.width * 1;
        const H = _project.config.height * 1;

        // Render for all slides into separate files
        let _index = 0;
        let _length = _slides.length;

        // Render function to render separate slides
        const _render = async () => {
        
            // If index > total-1 slides then finish
            if(_index > _length - 1) {

                // Log resolve and close
                console.log("Service/Slide.Render(): Project pre-render completed");
                _delay.resolve("Service/Slide.Render(): Project pre-render completed");
                return;

            };

            // Get current slide by index
            const _slide = _slides[_index];

            // Create new creator
            const _creator = new FFCreator({
                width: W,
                height: H
            });
            
            // Create new slide's scene
            const _scene = new FFScene();
            _scene.setBgColor("#000000");
            _scene.setDuration(_slide.totalTime);
            _creator.addChild(_scene);

            // Add narration to scene
            await Scene.AddAudio({
                projectId: projectId,
                scene: _scene,
                audio: `${_slide.id}.wav`,
                volume: 1,
                showAt: 0
            });
            
            // Add image to scene
            await Scene.AddImage({
                projectId: projectId,
                scene: _scene,
                image: _slide.image,
                totalTime: _slide.totalTime,
                width: W,
                height: H,
                showAt: 0,
                hideAt: (_slide.hideAt - _slide.showAt)
            });

            // Add video to scene
            await Scene.AddVideo({
                projectId: projectId,
                scene: _scene,
                video: _slide.video,
                totalTime: _slide.totalTime,
                width: W,
                height: H,
                showAt: 0
            });

            // Add main content to scene
            await Scene.AddText({
                projectId: projectId,
                scene: _scene,
                content: _slide.content,
                width: W,
                height: H,
                showAt: 0,
                hideAt: (_slide.hideAt - _slide.showAt)
            });

            // Start the rendering
            _creator.output(path.join(_projectPath, `/cache/${_slide.id}.mp4`));
            _creator.start();
            _creator.closeLog();

            // Register events
            _creator.on("start", () => {
                console.log(`Service/Slide.Render(): Project pre-render ${_slide.id} started`);
            });
            _creator.on("error", e => {
                console.log(`Service/Slide.Render(): Unable to pre-render project: ${_slide.id}`);
                _delay.reject("Service/Slide.Render(): Unable to pre-render project: ${_slide.id}");
            });
            _creator.on("progress", e => {
                console.log(`Service/Slide.Render(): Project pre-render: ${(e.percent * 100) >> 0}%`);
            });
            _creator.on("complete", e => {
                console.log(`Service/Slide.Render(): Project pre-render ${_slide.id} completed`);
                _index++;
                _render();
            });

        };
    
        // Start slide render
        _render();

    }
    catch(error) {

        // Log and reject
        console.log("Service/Slide.Render():", error);
        _delay.reject(error);

    };

    return _delay.promise;

};


export default { Render, Update, CompareModified };