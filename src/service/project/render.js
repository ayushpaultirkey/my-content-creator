import path from "path";
import crypto from "crypto";
import { FFScene, FFCreator } from "ffcreator";

import delay from "../../library/wait.js";

import Scene from "../scene.js";
import Project from "../project.js";


export default async function Render(projectId = "", sse = null) {

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
            _scene.addChild()
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

        // Add each slides into the scene
        for(const slide of _slides) {

            // Add narration to scene
            await Scene.AddAudio({
                projectId: projectId,
                scene: _scene,
                audio: `${slide.id}.wav`,
                volume: 1,
                showAt: slide.showAt
            });
            
            // Add image to scene
            await Scene.AddImage({
                projectId: projectId,
                scene: _scene,
                image: slide.image,
                totalTime: slide.totalTime,
                width: W,
                height: H,
                showAt: slide.showAt,
                hideAt: slide.hideAt
            });

            // Add video to scene
            await Scene.AddVideo({
                projectId: projectId,
                scene: _scene,
                video: slide.video,
                totalTime: slide.totalTime,
                width: W,
                height: H,
                showAt: slide.showAt
            });

            // Add main content to scene
            await Scene.AddText({
                projectId: projectId,
                scene: _scene,
                content: slide.content,
                width: W,
                height: H,
                showAt: slide.showAt,
                hideAt: slide.hideAt
            });
            
            // Log
            console.log(`Service/Project.Render(): scene ${slide.id} builded`);

            // Send SSE
            sse(`Rendering: Scene ${slide.id} builded`);

        }

        // Start rendering        
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