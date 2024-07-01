import fs from "fs/promises";
import path from "path";
import { FFText, FFAlbum, FFVideo, FFAudio } from "ffcreator";

import directory from "../library/directory.js";

import Project from "./project.js";

// Get directory path
const { __dirname } = directory();

async function ValidateAsset(projectId, asset) {
    
    //
    const _asset = [];
    for(const x of asset) {
        try {
            const _assetPath = path.join(Project.Path(projectId), "/asset/", x.name);
            await fs.access(_assetPath);
            _asset.push({
                name: _assetPath,
                effect: (typeof(x.effect) === "undefined" || x.effect.length < 2) ? "fadeIn" : x.effect
            });
        }
        catch(error) {
            console.log(`Service/Scene.ValidateAsset(): Cannot find ${x} asset file for ${projectId}`, error);
        };
    };

    return _asset;

};

async function AddVideo({ projectId, scene, video, totalTime, showAt, width, height }) {

    // Add video if its valid
    if(typeof(video) !== "undefined" && video.length > 0) {
        
        // Try and add video
        try {

            // Check if the video are valid
            const _asset = await ValidateAsset(projectId, video);

            // Add duration for each videos
            const _duration = totalTime / _asset.length; 
            for(var i = 0, len = _asset.length; i < len; i++) {

                // Calculate show and hide time
                const _showAt = showAt + i * _duration;
                const _hideAt = _showAt + _duration;

                // Create new video and add it scene
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

        }
        catch(error) {
            console.log("Service/Scene.AddVideo(): Unable to add video", error);
        };

    };

};

async function AddImage({ projectId, scene, image, totalTime, showAt, hideAt, width, height }) {

    // Add image if avaiable
    if(typeof(image) !== "undefined" && image.length > 0) {

        // Check if the images are valid
        const _asset = await ValidateAsset(projectId, image);

        // Create new album using images
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
        
    };

};


/**
    * 
    * @param {} config
*/
async function AddAudio({ projectId, scene, audio, volume, showAt, hideAt }) {

    // Add audio if available
    try {

        // Check if audio exists
        const _audioPath = path.join(Project.Path(projectId), `/asset/${audio}`);
        await fs.access(_audioPath);

        // Set audio file
        scene.addAudio({ path: _audioPath, start: showAt, volume: volume });

    }
    catch(error) {
        console.log(`Service/Scene.AddAudio(): Cannot find audio for ${projectId}`, error);
    };

};


async function AddText({ projectId, scene, content, showAt, hideAt, width, height }) {

    // Add text content
    try {

        const _text = new FFText({
            text: content,
            x: width / 2,
            y: height / 2,
        });
        _text.setColor("#ffffff");
        _text.addEffect("zoomIn", 1, showAt);
        _text.addEffect("fadeOut", 1, hideAt);
        _text.alignCenter();
        _text.setFont(path.join(__dirname, "../../project/.font/static/NotoSans-SemiBold.ttf"));
        _text.setWrap(width / 1.5);
        scene.addChild(_text);

    }
    catch(error) {
        console.log(`Service/Scene.AddText(): Cannot add text for ${projectId}`, error);
    };

};


export default { AddAudio, AddImage, AddVideo, AddText };