const { FFScene, FFText, FFVideo, FFAlbum, FFImage, FFCreator, FFAudio } = require("ffcreator");
const path = require("path");
const data = require("./data.json");
const fs = require("fs");
const sharp = require('sharp')

FFCreator.setFFmpegPath(path.join(__dirname, "./../library/ffmpeg/bin/ffmpeg.exe"));
FFCreator.setFFprobePath(path.join(__dirname, "./../library/ffmpeg/bin/ffprobe.exe"));

const W = 720;
const H = 1280;

function addText(txt = "", startAt = 0, endAt = 1) {
    
    const text = new FFText({
        text: txt,
        x: W / 2,
        y: H / 2,
        scale: 1.25
    });
    text.setColor("#ffffff");
    text.addEffect("zoomIn", 1, startAt);
    text.addEffect("fadeOut", 1, endAt);
    text.alignCenter();
    text.setWrap(600);
    return text;

}

function init(imgs = []) {

    const creator = new FFCreator({
        width: W,
        height: H
    });

    const scene = new FFScene();
    scene.setBgColor("#000000");
    scene.setDuration(data.totalTime);
    scene.setTransition("GridFlip", 2);
    creator.addChild(scene);

    const album = new FFAlbum({
        list: imgs,
        x: W / 2, y: H / 2,
        width: W,
        height: H,
        scale: 1.25
    });
    album.setTransition();
    album.setDuration(data.totalTime / imgs.length);
    album.setTransTime(1.5);
    scene.addChild(album);
    
    
    var index = 0;
    var len = data.slide.length;
    function adder() {
        if(index > len - 1) {
            console.log("DONE")
        }
        else {
            const _slide = data.slide[index];
            scene.addChild(addText(_slide.content, _slide.showAt, _slide.hideAt));
            console.log(_slide.content);
            index++;
            adder();
        }
    };
    adder();


    //
    const text = new FFText({
        text: "BREAKING NEWS",
        x: 20,
        y: 20,
        scale: 1
    });
    text.setColor("#ffffff");
    text.addEffect("zoomIn", 1, 0.5);
    //text.alignCenter();
    scene.addChild(text);


    //creator.addAudio({ path: path.join(__dirname, "./../audio/audio1.mp3") })
    
    creator.output(path.join(__dirname, "./out.mp4"));
    creator.start();
    creator.closeLog();

    creator.on('start', () => {
        console.log(`FFCreator start`);
    });
    creator.on('error', e => {
        console.log(`FFCreator error: ${JSON.stringify(e)}`);
    });
    creator.on('progress', e => {
        console.log((`FFCreator progress: ${e.state} ${(e.percent * 100) >> 0}%`));
    });
    creator.on('complete', e => {
        console.log((`FFCreator completed: \n USEAGE: ${e.useage} \n PATH: ${e.output} `));
    });

}
//init();

function prepImage() {

    const imgs = [];

    fs.readdir(path.join(__dirname, "../asset/global/image/"), (err, files) => {
        if(err) {
            console.log(err);
        }
        else {

            var index = 0;
            var length = files.length;
            function write() {
                if(index > length - 1) {
                    prepComplete(imgs);
                }
                else {

                    sharp(path.join(__dirname, "../asset/global/image/", files[index]))
                    .resize({ width: W, height: H, fit: 'cover'})
                    .toFile(path.join(__dirname, "../asset/project/", files[index]), (err) => {
                        if(err) {
                            console.log(err);
                        }
                        else {
                            console.log(path.join(__dirname, "../asset/project/", files[index]));
                            imgs.push(path.join(__dirname, "../asset/project/", files[index]));
                            index++;
                            write();
                        };
                    });

                };
            };
            write()

        }
    });

};
function prepComplete(imgs) {
    console.log("prep done");
    init(imgs);
}
prepImage();