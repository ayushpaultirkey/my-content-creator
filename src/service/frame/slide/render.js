import path from "path";
import { FFScene, FFCreator } from "ffcreator";

import delay from "#library/wait.js";
import Scene from "./scene.js";
import Duration from "./duration.js";


export default async function Render({ slide = [], root, width, height, callback = null }) {

    //
    const _delay = new delay();

    //
    try {

        //
        const W = width * 1;
        const H = height * 1;

        //
        let _index = 0;
        let _length = slide.length;

        //
        const _render = async () => {
        
            //
            if(_index > _length - 1) {

                //
                callback("Rendering: Project pre-render completed");
                console.log("S/Frame/Slide/Render(): Project pre-render completed");
                _delay.resolve("S/Frame/Slide/Render(): Project pre-render completed");
                return;

            };

            //
            const _slide = slide[_index];

            //
            const _duration = await Duration({
                path: path.join(root, `/asset/${_slide.id}.wav`),
                content: _slide.content
            });

            //
            const _creator = new FFCreator({
                width: W,
                height: H
            });
            
            //
            const _scene = new FFScene();
            _scene.setBgColor("#000000");
            _scene.setDuration(_duration);
            _creator.addChild(_scene);

            //
            await Scene.AddAudio({
                projectPath: root,
                scene: _scene,
                audio: `${_slide.id}.wav`,
                volume: 1,
                showAt: 0
            });
            
            //
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

            //
            await Scene.AddVideo({
                projectPath: root,
                scene: _scene,
                video: _slide.video,
                totalTime: _duration,
                width: W,
                height: H,
                showAt: 0
            });

            //
            await Scene.AddText({
                projectPath: root,
                scene: _scene,
                content: _slide.content,
                width: W,
                height: H,
                showAt: 0,
                hideAt: _duration
            });

            //
            _creator.output(path.join(root, `/cache/${_slide.id}.mp4`));
            _creator.start();
            _creator.closeLog();

            //
            _creator.on("start", () => {
                callback(`Rendering: Project pre-render ${_slide.id} started`);
                console.log(`S/Frame/Slide/Render(): Project pre-render ${_slide.id} started`);
            });
            _creator.on("error", () => {
                callback(`Rendering: Unable to pre-render project: ${_slide.id}`);
                console.log(`S/Frame/Slide/Render(): Unable to pre-render project: ${_slide.id}`);
                _delay.reject("S/Frame/Slide/Render(): Unable to pre-render project: ${_slide.id}");
            });
            _creator.on("progress", (e) => {
                callback(`Rendering: Project ${_slide.id} pre-render: ${(e.percent * 100) >> 0}%`);
                console.log(`S/Frame/Slide/Render(): Project ${_slide.id} pre-render: ${(e.percent * 100) >> 0}%`);
            });
            _creator.on("complete", async() => {

                //
                callback(`Rendering: Project pre-render ${_slide.id} completed`);

                //
                try {
                    //
                    console.log(`S/Frame/Slide/Render(): Project pre-render ${_slide.id} completed`);
                }
                catch(error) {
                    console.log(`S/Frame/Slide/Render(): Project pre-render ${_slide.id} completed but no thumbnail`);
                };

                _index++;
                await _render();

            });

        };
    
        //
        await _render();

    }
    catch(error) {

        //
        console.log("S/Frame/Slide/Render():", error);
        _delay.reject(error);

    };

    return _delay.promise;

};