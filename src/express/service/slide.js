import path from "path";
import fs from "fs/promises";
import { FFScene, FFText, FFCreator, FFAlbum, FFVideo } from "ffcreator";

import wait from "./wait.js";
import directory from "../../library/directory.js";

import { CreateVoice } from "./asset.js";
import { GenerativeRun } from "./gemini.js";
import { GetProjectPath, ReadProject, SaveProject } from "./project.js";


/**
    * 
    * @param {*} originalSlides 
    * @param {*} newSlides 
    * @returns 
*/
function FindUpdatedSlide(originalSlides = [], newSlides = []) {

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
            _originalMap.added.push(newSlide);
        };

    });

    // Remaining slides in originalMap are considered removed
    _update.removed = Array.from(_originalMap.values());

    return _update;

}


/**
    * 
    * @param {*} projectId 
    * @param {*} prompt 
    * @returns 
*/
async function UpdateSlide(projectId = "", prompt = "", callback) {

    try {
        
        // Get project data
        const _project = await ReadProject(projectId);
        
        // Generative run
        const _answer = await GenerativeRun(prompt, _project.session.context);

        // Get updated slides
        const _slide = FindUpdatedSlide(_project.property.slides, _answer.response.slides);
        const _slideUpdated = _slide.updated.concat(_slide.added);

        // Create audio and render the slides
        await CreateVoice(projectId, _slideUpdated);
        await RenderSlide(projectId, _slideUpdated, _project);

        // Create updated project
        const _projectUpdated = {
            "config": { ... _project.config },
            "property": { ... _answer.response },
            "session": {
                "context": _answer.context
            }
        };

        // Save project file
        await SaveProject(projectId, _projectUpdated);

        // Return new project
        return _projectUpdated;

    }
    catch(error) {
        console.log("UpdateSlide():", error);
        throw error;
    }

};


/**
    * 
    * @param {*} projectId 
    * @param {*} slide 
    * @param {*} project 
    * @returns 
*/
async function RenderSlide(projectId = "", slide = [], project = {}) {

    // Create new promise
    const _wait = new wait();

    //
    try {

        // Get current directory path and filename
        const { __dirname } = directory();
        FFCreator.setFFmpegPath(path.join(__dirname, "./../../library/ffmpeg.exe"));
        FFCreator.setFFprobePath(path.join(__dirname, "./../../library/ffprobe.exe"));

        // Get project path
        const _path = GetProjectPath(projectId);

        // Set video dimension
        const S = 1;
        const W = 720 / S;
        const H = 1280 / S;

        // Render for all slides into separate files
        let _index = 0;
        let _length = slide.length;

        // Render function to render separate slides
        const render = async () => {
        
            // If index > total slides then finish
            if(_index > _length - 1) {
                console.log("RenderSlide(): Project pre-render completed");
                _wait.resolve("RenderSlide(): Project pre-render completed");
                return;
            };

            // Get current slide by index
            const _slide = slide[_index];

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

            // Try and add narration if avaiable
            try {

                const _audioPath = path.join(_path, `/asset/${_slide.id}.wav`);
                await fs.access(_audioPath);

                _scene.addAudio({ path: _audioPath, start: 0 });

            }
            catch(error) {
                console.log(`RenderSlide(): Cannot find narration voice for ${_slide.id}`, error);
            };

            // Add image if avaiable
            if(typeof(_slide.image) !== "undefined" && _slide.image.length > 0) {

                // Check if the images are valid
                const _image = [];
                for(const x of _slide.image) {
                    try {
                        const _imagePath = path.join(_path, "/asset/", x.name);
                        await fs.access(_imagePath);
                        _image.push(_imagePath);
                    }
                    catch(error) {
                        console.log(`RenderSlide(): Cannot find ${x} image asset file for ${_slide.id}`, error);
                    };
                };

                // Create new album
                const _album = new FFAlbum({
                    list: _image,
                    x: W / 2,
                    y: H / 2,
                    width: W,
                    height: H,
                    scale: 1.25
                });
                _album.setTransition();
                _album.setDuration(_slide.totalTime / _slide.image.length);
                _album.setTransTime(1.5);
                _scene.addChild(_album);
                
            };

            // Try and add video clip
            try {

                // Check if the video is valid
                if(typeof(_slide.video) === "undefined" || typeof (_slide.video.name) === "undefined" || _slide.video.name.length == 0) {
                    throw new Error("Invalid video or not defined");
                };

                // Get the transition and the video src
                const _videoEffect = (typeof(_slide.video.effect) === "undefined" || _slide.video.effect.length < 2) ? "fadeIn" : _slide.video.effect;
                const _videoPath = path.join(_path, `/asset/${_slide.video.name}`);
                await fs.access(_videoPath);

                // Create new video and add it scene
                const _video = new FFVideo({
                    path: _videoPath,
                    width: W,
                    height: H,
                    x: W / 2,
                    y: H / 2,
                    scale: 1.25
                });
                _video.addEffect(_videoEffect, 1, 0);
                _scene.addChild(_video);

            }
            catch(error) {
                console.log(`RenderSlide(): Cannot add video ${_slide.id}`, error);
            };

            // Add the slide's content
            const _text = new FFText({
                text: _slide.content,
                x: W / 2,
                y: H / 2,
            });
            _text.setColor("#ffffff");
            _text.addEffect("zoomIn", 1, 0);
            _text.addEffect("fadeOut", 1, _slide.hideAt - _slide.showAt);
            _text.alignCenter();
            _text.setWrap(W / 1.5);
            _scene.addChild(_text);

            // Start the rendering
            _creator.output(path.join(_path, `./cache/${_slide.id}.mp4`));
            _creator.start();
            _creator.closeLog();

            // Register events
            _creator.on("start", () => {
                console.log(`RenderSlide(): Project pre-render ${_slide.id} started`);
            });
            _creator.on("error", e => {
                console.log(`RenderSlide(): Unable to pre-render project: ${_slide.id}`);
                _wait.reject("RenderSlide(): Unable to pre-render project: ${_slide.id}");
            });
            _creator.on("progress", e => {
                console.log(`RenderSlide(): Project pre-render: ${(e.percent * 100) >> 0}%`);
            });
            _creator.on("complete", e => {
                console.log(`RenderSlide(): Project pre-render ${_slide.id} completed`);
                _index++;
                render();
            });

        };
    
        // Start slide render
        render();

    }
    catch(error) {
        console.log("RenderSlide():", error);
        _wait.reject(error);
    };

    return _wait.promise;

};


export { RenderSlide, UpdateSlide };