import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { FFScene, FFCreator, FFAlbum, FFAudio, FFVideoAlbum } from "ffcreator";

import directory from "../../library/directory.js";
import delay from "../../library/wait.js";

import Scene from "../scene.js";
import Project from "../project.js";

// Get directory path
const { __dirname, __root } = directory();

export default async function Render(projectId = "", sse = null) {

    // Create new promise
    const _delay = new delay();

    //
    try {

        // Export name for file
        const _exportName = `${crypto.randomUUID()}.mp4`;
        const _exportPath = path.join(__root, `/project/.cache/${_exportName}`);

        // Get project
        const _project = await Project.GetActive(projectId);

        // Set ffmpeg path
        FFCreator.setFFmpegPath(path.join(__root, "/library/ffmpeg.exe"));
        FFCreator.setFFprobePath(path.join(__root, "/library/ffprobe.exe"));

        // Get project path
        const _projectPath = Project.Path(projectId);

        // Get property and slides
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

        // // Create new global scene
        // const _scene = new FFScene();
        // _scene.setBgColor("transparent");
        // _scene.setDuration(_property.totalTime);
        // _creator.addChild(_scene);
        
        // // Add audio to background
        // if(_project.backgroundAudio) {
        //     await Scene.AddAudio({
        //         projectId: projectId,
        //         scene: _scene,
        //         audio: _project.backgroundAudio,
        //         volume: 0.5,
        //         showAt: 0,
        //         creator: _creator
        //     });
        //     _scene.addChild()
        // };

        // // Add image to background
        // await Scene.AddImage({
        //     projectId: projectId,
        //     scene: _scene,
        //     image: _property.backgroundImage,
        //     totalTime: _property.totalTime,
        //     width: W,
        //     height: H,
        //     showAt: 0,
        //     hideAt: _property.totalTime
        // });

        // // Add video to background
        // await Scene.AddVideo({
        //     projectId: projectId,
        //     scene: _scene,
        //     video: _property.backgroundVideo,
        //     totalTime: _property.totalTime,
        //     width: W,
        //     height: H,
        //     showAt: 0
        // });

        // // Add each slides into the scene
        // for(const slide of _slides) {

        //     //
        //     const _wait = new delay();

        //     // Add narration to scene
        //     await Scene.AddAudio({
        //         projectId: projectId,
        //         scene: _scene,
        //         audio: `${slide.id}.wav`,
        //         volume: 1,
        //         showAt: slide.showAt,
        //         hideAt: slide.hideAt
        //     });
            
        //     // Add image to scene
        //     await Scene.AddImage({
        //         projectId: projectId,
        //         scene: _scene,
        //         image: slide.image,
        //         totalTime: slide.totalTime,
        //         width: W,
        //         height: H,
        //         showAt: slide.showAt,
        //         hideAt: slide.hideAt
        //     });

        //     // Add video to scene
        //     await Scene.AddVideo({
        //         projectId: projectId,
        //         scene: _scene,
        //         video: slide.video,
        //         totalTime: slide.totalTime,
        //         width: W,
        //         height: H,
        //         showAt: slide.showAt
        //     });

        //     // Add main content to scene
        //     await Scene.AddText({
        //         projectId: projectId,
        //         scene: _scene,
        //         content: slide.content,
        //         width: W,
        //         height: H,
        //         showAt: slide.showAt,
        //         hideAt: slide.hideAt
        //     });
            
        //     // Log
        //     console.log(`Service/Project/Render(): scene ${slide.id} builded`);

        //     // Send SSE
        //     sse(`Rendering: Scene ${slide.id} builded`);

        //     //
        //     setTimeout(() => { _wait.resolve() }, 2000);
        //     await _wait.promise;

        // };
        

        function _volumeRange(value, inputStart, inputEnd, outputStart, outputEnd) {
            return outputStart + (value - inputStart) * (outputEnd - outputStart) / (inputEnd - inputStart);
        };


        let _index = 0;

        // Add each slides into the scene
        for(const slide of _slides) {

            // Create new global scene
            const _scene = new FFScene();
            _scene.setBgColor("transparent");
            _scene.setDuration(slide.totalTime);
            _creator.addChild(_scene);

            // Add narration to scene
            await Scene.AddAudio({
                projectId: projectId,
                scene: _scene,
                audio: `${slide.id}.wav`,
                volume: 1 + (_volumeRange(_index, 0, _slides.length, 1, 0) * 15),
                showAt: 0,
                hideAt: slide.totalTime
            });
            console.log(1 + (_volumeRange(_index, 0, _slides.length, 1, 0) * 15));
            _index++;
            
            // Add image to scene
            await Scene.AddImage({
                projectId: projectId,
                scene: _scene,
                image: slide.image,
                totalTime: slide.totalTime,
                width: W,
                height: H,
                showAt: 0,
                hideAt: slide.totalTime
            });

            // Add video to scene
            await Scene.AddVideo({
                projectId: projectId,
                scene: _scene,
                video: slide.video,
                totalTime: slide.totalTime,
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
                hideAt: slide.totalTime
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