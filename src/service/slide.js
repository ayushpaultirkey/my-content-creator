import path from "path";
import fs from "fs/promises";
import { FFScene, FFText, FFCreator, FFAlbum, FFVideo } from "ffcreator";

import wait from "../library/wait.js";
import directory from "../library/directory.js";

import Asset from "./asset.js";
import Gemini from "./google/gemini.js";

import Project from "./project.js";
import GetUpdatedSlide from "./slide/getUpdatedSlide.js";

// Get current directory path and filename
const { __dirname } = directory();

async function Update(projectId = "", prompt = "", file = null) {

    try {

        // Get project data
        const _project = await Project.GetActive(projectId);
        const _history = _project.history;

        // Check for file
        if(file !== null) {
            console.log("Service/Slide.Update(): File found");
            await Gemini.PromptFile(file, _history);
        };

        // Generative run
        const _answer = await Gemini.Prompt(prompt, _history);

        // Get updated slides
        const _slide = GetUpdatedSlide(_project.property.slides, _answer.response.slides);
        const _slideUpdated = _slide.updated.concat(_slide.added);

        // Create updated project
        const _projectUpdated = {
            config: { ... _project.config },
            property: { ... _answer.response },
            history: _history
        };

        // Create audio and render the slides
        await Asset.CreateVoiceAsset(projectId, _slideUpdated);
        await Render(projectId, _projectUpdated);

        // Save project file
        await Project.Update(projectId, _projectUpdated);

        // Return new project
        return _projectUpdated;

    }
    catch(error) {
        console.log("Service/Slide.Update():", error);
        throw error;
    }

};


async function Render(projectId = "", project = {}) {

    // Create new promise
    const _wait = new wait();

    //
    try {

        FFCreator.setFFmpegPath(path.join(__dirname, "./../../library/ffmpeg.exe"));
        FFCreator.setFFprobePath(path.join(__dirname, "./../../library/ffprobe.exe"));

        // Get project path
        const _projectPath = Project.Path(projectId);

        // Get slides
        const _slides = project.property.slides;

        // Set video dimension
        const S = 1;
        const W = project.config.width * 1;
        const H = project.config.height * 1;

        // Render for all slides into separate files
        let _index = 0;
        let _length = _slides.length;

        // Render function to render separate slides
        const render = async () => {
        
            // If index > total slides then finish
            if(_index > _length - 1) {
                console.log("Service/Slide.Render(): Project pre-render completed");
                _wait.resolve("Service/Slide.Render(): Project pre-render completed");
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

            // Add narration if available
            try {

                // Get narration audio path
                const _audioPath = path.join(_projectPath, `/asset/${_slide.id}.wav`);
                await fs.access(_audioPath);

                // Add narration file
                _scene.addAudio({ path: _audioPath, start: 0 });

            }
            catch(error) {
                console.log(`Service/Slide.Render(): Cannot find narration voice for ${_slide.id}`, error);
            };

            // Add image if available
            if(typeof(_slide.image) !== "undefined" && _slide.image.length > 0) {

                // Check if the images are valid
                const _image = [];
                for(const x of _slide.image) {
                    try {
                        const _imagePath = path.join(_projectPath, "/asset/", x.name);
                        await fs.access(_imagePath);
                        _image.push(_imagePath);
                    }
                    catch(error) {
                        console.log(`Service/Slide.Render(): Cannot find ${x} image asset file for ${_slide.id}`, error);
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

            // Add video if available
            if(typeof(_slide.video) !== "undefined" && _slide.video.length > 0 && typeof(_slide.video[0].name) !== "undefined") {
            
                // Try and add video
                try {

                    // Get the transition and the video src
                    const _videoEffect = (typeof(_slide.video[0].effect) === "undefined" || _slide.video[0].effect.length < 2) ? "fadeIn" : _slide.video[0].effect;
                    const _videoPath = path.join(_projectPath, `/asset/${_slide.video[0].name}`);
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
                    console.log(`Service/Slide.Render(): Unable to add video ${_slide.video[0].name} for ${_slide.id}`, error);
                };

            };

            // Add the slide's content
            const _text = new FFText({
                text: _slide.content,
                x: W / 2,
                y: H / 2,
            });
            _text.setColor("#ffffff");
            _text.addEffect("zoomIn", 1, 0);
            _text.addEffect("fadeOut", 1, (_slide.totalTime < 2) ? _slide.totalTime : (_slide.totalTime - 0.5));
            _text.alignCenter();
            _text.setFont(path.join(__dirname, "../../project/.font/static/NotoSans-SemiBold.ttf"));
            _text.setWrap(W / 1.5);
            _scene.addChild(_text);

            // Start the rendering
            _creator.output(path.join(_projectPath, `./cache/${_slide.id}.mp4`));
            _creator.start();
            _creator.closeLog();

            // Register events
            _creator.on("start", () => {
                console.log(`Service/Slide.Render(): Project pre-render ${_slide.id} started`);
            });
            _creator.on("error", e => {
                console.log(`Service/Slide.Render(): Unable to pre-render project: ${_slide.id}`);
                _wait.reject("Service/Slide.Render(): Unable to pre-render project: ${_slide.id}");
            });
            _creator.on("progress", e => {
                console.log(`Service/Slide.Render(): Project pre-render: ${(e.percent * 100) >> 0}%`);
            });
            _creator.on("complete", e => {
                console.log(`Service/Slide.Render(): Project pre-render ${_slide.id} completed`);
                _index++;
                render();
            });

        };
    
        // Start slide render
        render();

    }
    catch(error) {
        console.log("Service/Slide.Render():", error);
        _wait.reject(error);
    };

    return _wait.promise;

};


export default { Render, Update };