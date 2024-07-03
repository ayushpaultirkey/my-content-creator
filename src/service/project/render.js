import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { FFScene, FFCreator } from "ffcreator";

import delay from "../../library/wait.js";
import directory from "../../library/directory.js";

import Scene from "../slide/scene.js";
import Project from "../project.js";
import Duration from "./../slide/duration.js";

// Get directory path
const { __root } = directory();

export default async function Render(projectId = "", sse = null) {

    // Create new promise
    const _delay = new delay();

    //
    try {

        // Set ffmpeg path
        FFCreator.setFFmpegPath(path.join(__root, "/library/ffmpeg.exe"));
        FFCreator.setFFprobePath(path.join(__root, "/library/ffprobe.exe"));

        // Export name for file
        const _exportName = `${crypto.randomUUID()}.mp4`;
        const _exportPath = path.join(__root, `/project/.cache/${_exportName}`);

        // Get project data, path, property and sldies
        const _project = await Project.GetActive(projectId);
        const _projectPath = Project.Path(projectId);
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

        // Create volume index
        let _vindex = 0;
        function _volumeMapping(v, inStart, inEnd, outStart, outEnd) {
            return outStart + (v - inStart) * (outEnd - outStart) / (inEnd - inStart);
        };

        // Add each slides into the scene
        for(const slide of _slides) {

            // Get narration audio length
            const _duration = await Duration({
                dir: path.join(_projectPath, `/asset/${slide.id}.wav`),
                content: slide.content
            });

            // Create new global scene
            const _scene = new FFScene();
            _scene.setBgColor("#000000");
            _scene.setDuration(_duration);
            _creator.addChild(_scene);

            // Add narration to scene
            await Scene.AddAudio({
                projectId: projectId,
                scene: _scene,
                audio: `${slide.id}.wav`,
                volume: 1 + (_volumeMapping(_vindex, 0, _slides.length, 1, 0) * 10),
                showAt: 0,
            });
            _vindex++;
            
            // Add image to scene
            await Scene.AddImage({
                projectId: projectId,
                scene: _scene,
                image: slide.image,
                totalTime: _duration,
                width: W,
                height: H,
                showAt: 0,
                hideAt: _duration
            });

            // Add video to scene
            await Scene.AddVideo({
                projectId: projectId,
                scene: _scene,
                video: slide.video,
                totalTime: _duration,
                width: W,
                height: H,
                showAt: 0
            });

            // Add main content to scene
            await Scene.AddText({
                projectId: projectId,
                scene: _scene,
                content: slide.content,
                width: W,
                height: H,
                showAt: 0,
                hideAt: _duration
            });
            
            // Log
            console.log(`Service/Project/Render(): scene ${slide.id} builded`);

            // Send SSE
            sse(`Rendering: Scene ${slide.id} builded`);

        };

        // Start rendering        
        _creator.output(_exportPath);
        _creator.start();
        _creator.closeLog();
        
        // Register events
        _creator.on("start", () => {

            // Send SSE
            sse(`Rendering: Project rendering started`);

            // Log
            console.log(`Service/Project/Render(): Project render ${projectId} started`);
            
        });
        _creator.on("error", e => {
            
            // Send SSE
            sse(`Rendering: Error while rendering project`);

            // Log and reject
            console.log(`Service/Project/Render(): Unable to render project: ${projectId}`);
            _delay.reject(`Service/Project/Render(): Unable to render project: ${projectId}`);

        });
        _creator.on("progress", e => {

            // Send SSE
            sse(`Rendering: Project render status: ${(e.percent * 100) >> 0}%`);

            // Log
            console.log(`Service/Project/Render(): Project render: ${(e.percent * 100) >> 0}%`);

        });
        _creator.on("complete", async(e) => {

            try {

                // Copy rendered file to project's export directory
                await fs.copyFile(_exportPath, path.join(_projectPath, "/render.mp4"));

                // Send SSE
                sse(`Rendering: Project render completed`);
    
                // Log and resolve
                console.log(`Service/Project/Render(): Project render ${projectId} completed`);
                _delay.resolve(_exportName);

            }
            catch(error) {

                // Log and reject
                console.log("Service/Project/Render(): Failed to move video to project", error);
                _delay.reject("Service/Project/Render(): Error while moving file to project");

            };
            
        });

    }
    catch(error) {

        // Send SSE
        sse(`Rendering: Error while rendering project`);

        // Log and reject
        console.log("Service/Project/Render():", error);
        _delay.reject(error);
        
    }

    return _delay.promise;

};
//#endregion