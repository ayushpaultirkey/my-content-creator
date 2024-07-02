import path from "path";
import { FFScene, FFCreator } from "ffcreator";

import delay from "../../library/wait.js";
import Scene from "../scene.js";
import Project from "../project.js";
import Duration from "./duration.js";


export default async function Render(projectId = "", slide = null, callback = null) {

    // Create new promise
    const _delay = new delay();

    //
    try {

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
                callback("Rendering: Project pre-render completed");
                console.log("Service/Slide/Render(): Project pre-render completed");
                _delay.resolve("Service/Slide/Render(): Project pre-render completed");
                return;

            };

            // Get current slide by index
            const _slide = _slides[_index];

            // Get audio length
            const _duration = await Duration({
                dir: path.join(_projectPath, `/asset/${_slide.id}.wav`),
                content: _slide.content
            });

            // Create new creator
            const _creator = new FFCreator({
                width: W,
                height: H
            });
            
            // Create new slide's scene
            const _scene = new FFScene();
            _scene.setBgColor("#000000");
            _scene.setDuration(_duration);
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
                video: _slide.video,
                totalTime: _duration,
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
                hideAt: _duration
            });

            // Start the rendering
            _creator.output(path.join(_projectPath, `/cache/${_slide.id}.mp4`));
            _creator.start();
            _creator.closeLog();

            // Register events
            _creator.on("start", () => {
                callback(`Rendering: Project pre-render ${_slide.id} started`);
                console.log(`Service/Slide/Render(): Project pre-render ${_slide.id} started`);
            });
            _creator.on("error", () => {
                callback(`Rendering: Unable to pre-render project: ${_slide.id}`);
                console.log(`Service/Slide/Render(): Unable to pre-render project: ${_slide.id}`);
                _delay.reject("Service/Slide/Render(): Unable to pre-render project: ${_slide.id}");
            });
            _creator.on("progress", (e) => {
                callback(`Rendering: Project ${_slide.id} pre-render: ${(e.percent * 100) >> 0}%`);
                console.log(`Service/Slide/Render(): Project ${_slide.id} pre-render: ${(e.percent * 100) >> 0}%`);
            });
            _creator.on("complete", async() => {

                // Log
                callback(`Rendering: Project pre-render ${_slide.id} completed`);

                // Create thumbnail
                try {
                    // await Thumbnail.Create(projectId, _slide, _duration);
                    console.log(`Service/Slide/Render(): Project pre-render ${_slide.id} completed`);
                }
                catch(error) {
                    console.log(`Service/Slide/Render(): Project pre-render ${_slide.id} completed but no thumbnail`);
                };

                _index++;
                await _render();

            });

        };
    
        // Start slide render
        await _render();

    }
    catch(error) {

        // Log and reject
        console.log("Service/Slide/Render():", error);
        _delay.reject(error);

    };

    return _delay.promise;

};