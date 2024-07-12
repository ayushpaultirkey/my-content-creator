import path from "path";
import { FFScene, FFCreator } from "ffcreator";
import chalk from "chalk";
import delay from "#library/wait.js";
import Scene from "./scene.js";
import Duration from "./duration.js";


export default async function Render({ slide = [], root, width, height, callback = null }) {

    // Create new promise
    const _delay = new delay();

    //
    try {

        // Set video dimension
        const W = width * 1;
        const H = height * 1;

        // The index and total number of the slides
        let _index = 0;
        let _length = slide.length;

        // Render the slides
        const _render = async () => {
        
            // Finish rendering
            if(_index > _length - 1) {

                callback("Rendering: Project pre-render completed");
                console.log(chalk.green("/S/Frame/Slide/Render():"), "Project pre-render completed");
                _delay.resolve("Project pre-render completed");
                return;

            };

            // Get slide and the total duration
            const _slide = slide[_index];

            const _duration = await Duration({
                filePath: path.join(root, `/asset/${_slide.id}.wav`),
                content: _slide.content
            });

            // Create new creator
            const _creator = new FFCreator({
                width: W,
                height: H
            });
            
            // Create new scene
            const _scene = new FFScene();
            _scene.setBgColor("#000000");
            _scene.setDuration(_duration);
            _creator.addChild(_scene);

            // Add narration to scene
            await Scene.AddAudio({
                projectPath: root,
                scene: _scene,
                audio: `${_slide.id}.wav`,
                volume: 1,
                showAt: 0
            });
            
            // Add image to scene
            await Scene.AddImage({
                projectPath: root,
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
                projectPath: root,
                scene: _scene,
                video: _slide.video,
                totalTime: _duration,
                width: W,
                height: H,
                showAt: 0
            });

            // Add main content to scene
            await Scene.AddText({
                projectPath: root,
                scene: _scene,
                content: _slide.content,
                width: W,
                height: H,
                showAt: 0,
                hideAt: _duration
            });

            // Start rendering    
            _creator.output(path.join(root, `/cache/${_slide.id}.mp4`));
            _creator.start();
            _creator.closeLog();

             // Register events
            _creator.on("start", () => {

                callback(`Rendering: Project pre-render ${_slide.id} started`);
                console.log(chalk.green(`/S/Frame/Slide/Render():`), `Project pre-render ${_slide.id} started`);

            });
            _creator.on("error", () => {

                callback(`Rendering: Unable to pre-render project: ${_slide.id}`);
                console.log(chalk.red(`S/Frame/Slide/Render():`), `Unable to pre-render project: ${_slide.id}`);
                _delay.reject(`Unable to pre-render project: ${_slide.id}`);

            });
            _creator.on("progress", (e) => {

                callback(`Rendering: Project ${_slide.id} pre-render: ${(e.percent * 100) >> 0}%`);
                console.log(chalk.yellow(`/S/Frame/Slide/Render():`), `Project ${_slide.id} pre-render: ${(e.percent * 100) >> 0}%`);
            
            });
            _creator.on("complete", async() => {

                callback(`Rendering: Project pre-render ${_slide.id} completed`);
                console.log(chalk.green(`S/Frame/Slide/Render():`), `Project pre-render ${_slide.id} completed`);

                _index++;
                await _render();

            });

        };
    
        // Start the rendering
        await _render();

    }
    catch(error) {
        console.log(chalk.red("/S/Frame/Slide/Render():"), error);
        _delay.reject(error);
    };

    return _delay.promise;

};