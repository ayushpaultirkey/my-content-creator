import fs from "fs/promises";
import path from "path";
import { FFText, FFAlbum, FFVideo } from "ffcreator";
import directory from "#library/directory.js";
import Validate from "./scene/validate.js";
import chalk from "chalk";


// Get directory path
const { __root } = directory();


async function AddVideo({ projectPath, scene, video, totalTime, showAt, width, height }) {

    // Add video if its valid
    if(typeof(video) !== "undefined" && video.length > 0) {
        
        // Try and add video
        try {

            // Check if the video are valid
            const _asset = await Validate(projectPath, video);

            // Add duration for each videos
            const _duration = totalTime / _asset.length; 
            for(var i = 0, len = _asset.length; i < len; i++) {

                // Calculate show and hide time
                const _showAt = showAt + i * _duration;
                const _hideAt = _showAt + _duration;

                // Create new video and add it scene
                /** @type {import("ffcreator").FFVideo} */
                const _video = new FFVideo({
                    path: _asset[i].name,
                    width: width,
                    height: height,
                    x: width / 2,
                    y: height / 2,
                    scale: 1.25,
                });
                _video.addEffect(_asset[i].effect, 1, _showAt);
                _video.addEffect("fadeOut", 1, _hideAt);
                scene.addChild(_video);

            };

            //
            console.log(chalk.green("/S/Frame/Scene/AddVideo(): Video added"));

        }
        catch(error) {
            console.log(chalk.red("/S/Frame/Scene/AddVideo():"), error);
        };

    };

};


async function AddImage({ projectPath, scene, image, totalTime, showAt, hideAt, width, height }) {

    try {

        // Add image if avaiable
        if(typeof(image) !== "undefined" && image.length > 0) {
    
            // Check if the images are valid
            const _asset = await Validate(projectPath, image);
    
            // Create new album using images
            /** @type {import("ffcreator").FFAlbum} */
            const _album = new FFAlbum({
                list: _asset.map(x => x.name),
                x: width / 2,
                y: height / 2,
                width: width,
                height: height,
                scale: 1.25
            });
            _album.setTransition();
            _album.setDuration(totalTime / _asset.length);
            _album.setTransTime(1);
            _album.addEffect("fadeIn", 1, showAt);
            _album.addEffect("fadeOut", 1, hideAt);
            scene.addChild(_album);
            
            //
            console.log(chalk.green("/S/Frame/Scene/AddImage():"), "Image added");
    
        };

    }
    catch(error) {
        console.log(chalk.red(`/S/Frame/Scene/AddImage():`), error);
    }

};

async function AddBGM({ projectPath, creator, audio, volume }) {

    // Add audio if available
    try {

        // Check if audio exists
        const _audioPath = path.join(projectPath, `/asset/${audio}`);
        await fs.access(_audioPath);

        // Set audio file
        creator.addAudio({ path: _audioPath, start: 0, volume: volume });

        //
        console.log(chalk.green("/S/Frame/Scene/AddBGM():"), "Background audio added");

    }
    catch(error) {
        console.log(chalk.red(`/S/Frame/Scene/AddBGM():`), error);
    };

}


async function AddAudio({ projectPath, scene, audio, volume, showAt }) {

    // Add audio if available
    try {

        // Check if audio exists
        const _audioPath = path.join(projectPath, `/asset/${audio}`);
        await fs.access(_audioPath);

        // Set audio file
        scene.addAudio({ path: _audioPath, start: showAt, volume: volume });

        //
        console.log(chalk.green("/S/Frame/Scene/AddAudio():"), "Audio added");

    }
    catch(error) {
        console.log(chalk.red(`/S/Frame/Scene/AddAudio():`), error);
    };

};


function CreateTextOutline({ scene, content, showAt, hideAt, width, height }) {

    const _text = [];
    const _offset = 3;
    const _centerX = width / 2;
    const _centerY = height / 2;

    _text.push(new FFText({ text: content, x: _centerX - _offset, y: _centerY }));
    _text.push(new FFText({ text: content, x: _centerX + _offset, y: _centerY }));
    _text.push(new FFText({ text: content, x: _centerX, y: _centerY - _offset }));
    _text.push(new FFText({ text: content, x: _centerX, y: _centerY + _offset }));

    _text.push(new FFText({ text: content, x: _centerX - _offset, y: _centerY - _offset }));
    _text.push(new FFText({ text: content, x: _centerX + _offset, y: _centerY + _offset }));
    _text.push(new FFText({ text: content, x: _centerX - _offset, y: _centerY + _offset }));
    _text.push(new FFText({ text: content, x: _centerX + _offset, y: _centerY - _offset }));

    for(var i = 0; i < _text.length; i++) {

        _text[i].setColor("black");
        _text[i].addEffect("zoomIn", 1, showAt);
        _text[i].addEffect("fadeOut", 1, hideAt);
        _text[i].alignCenter();
        _text[i].setFont(path.join(__root, "/project/.font/static/NotoSans-SemiBold.ttf"));
        _text[i].setWrap(width / 1.5);
        scene.addChild(_text[i]);

    };
    
};


async function AddText({ projectPath, scene, content, showAt, hideAt, width, height }) {

    // Add text content
    try {

        // Create text shadow using offsets
        CreateTextOutline({
            scene: scene,
            content: content,
            showAt: showAt,
            hideAt: hideAt,
            width: width,
            height: height
        });

        /** @type {import("ffcreator").FFText} */
        const _text2 = new FFText({
            text: content,
            x: (width / 2) - 2,
            y: (height / 2) - 2,
        });
        _text2.setColor("black");
        _text2.addEffect("zoomIn", 1, showAt);
        _text2.addEffect("fadeOut", 1, hideAt);
        _text2.alignCenter();
        _text2.setFont(path.join(__root, "/project/.font/static/NotoSans-SemiBold.ttf"));
        _text2.setWrap(width / 1.5);
        scene.addChild(_text2);

        /** @type {import("ffcreator").FFText} */
        const _text3 = new FFText({
            text: content,
            x: (width / 2) + 2,
            y: (height / 2) + 2,
        });
        _text3.setColor("black");
        _text3.addEffect("zoomIn", 1, showAt);
        _text3.addEffect("fadeOut", 1, hideAt);
        _text3.alignCenter();
        _text3.setFont(path.join(__root, "/project/.font/static/NotoSans-SemiBold.ttf"));
        _text3.setWrap(width / 1.5);
        scene.addChild(_text3);

        /** @type {import("ffcreator").FFText} */
        const _text = new FFText({
            text: content,
            x: width / 2,
            y: height / 2,
        });
        _text.setColor("white");
        _text.addEffect("zoomIn", 1, showAt);
        _text.addEffect("fadeOut", 1, hideAt);
        _text.alignCenter();
        _text.setFont(path.join(__root, "/project/.font/static/NotoSans-SemiBold.ttf"));
        _text.setWrap(width / 1.5);
        scene.addChild(_text);
        

        //
        console.log(chalk.green("/S/Frame/Scene/AddText():"), "Text added");

    }
    catch(error) {
        console.log(chalk.red(`/S/Frame/Scene/AddText():`), error);
    };

};


// Export
export default { AddAudio, AddImage, AddVideo, AddText, AddBGM };