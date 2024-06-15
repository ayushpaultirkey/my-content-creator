import path from "path";
import fs from "fs/promises";
import directory from "../../library/directory.js";
import { FFScene, FFText, FFVideo, FFAlbum, FFImage, FFCreator, FFAudio } from "ffcreator";
import wait from "./wait.js";

const project = null;

/**
    * Reads project file
    * @param {string} projectId
    * @returns {Promise<object>}
*/
async function readProject(projectId = "") {
    try {
        const content = await fs.readFile(projectId, "utf8");
        return JSON.parse(content);
    }
    catch (error) {
        throw new Error(`Failed to read or parse json file`);
    };
};


/**
    * Checks if project exists at given path
    * @param {string} projectId
*/
async function doesProjectExist(projectId = "") {
    try {
        await fs.access(projectId);
        return true;
    }
    catch(error) {
        if(error.code === "ENOENT") {
            return false;
        }
        else {
            throw error;
        };
    };
};





async function projectSlideRender(projectId = "", slides = []) {

    // Create new promise
    const sleep = new wait();

    //
    try {

        // Get current directory path and filename
        const { __dirname } = directory();
        FFCreator.setFFmpegPath(path.join(__dirname, "./../../library/ffmpeg/bin/ffmpeg.exe"));
        FFCreator.setFFprobePath(path.join(__dirname, "./../../library/ffmpeg/bin/ffprobe.exe"));

        // Get project path
        const projectPath = path.join(__dirname, `../../public/project/${projectId}`);

        // Set video dimension
        const S = 1;
        const W = 720 / S;
        const H = 1280 / S;

        // Render for all slides into separate files
        let index = 0;
        let length = slides.length;
        const render = () => {
        
            if(index > length - 1) {

                console.log("Project pre-render completed");
                sleep.resolve("Project pre-render completed");

            }
            else {

                //
                const slide = slides[index];

                //
                const creator = new FFCreator({
                    width: W,
                    height: H
                });
                    
                //
                const scene = new FFScene();
                scene.setBgColor("#000000");
                scene.setDuration(slide.time);
                scene.setTransition("GridFlip", 2);
                creator.addChild(scene);

                //
                const text = new FFText({
                    text: slide.content,
                    x: W / 2,
                    y: H / 2,
                });
                text.setColor("#ffffff");
                text.addEffect("zoomIn", 1, 0);
                text.addEffect("fadeOut", 1, slide.hideAt - slide.showAt);
                text.alignCenter();
                text.setWrap(W / 1.5);
                scene.addChild(text);

                //
                creator.output(path.join(projectPath, `./cache/${slide.id}.mp4`));
                creator.start();
                creator.closeLog();

                //
                console.log(path.join(projectPath, `./cache/${slide.id}.mp4`))

                //
                creator.on("start", () => {
                    console.log(`Project pre-render started`);
                });
                creator.on("error", e => {
                    console.log(`Unable to pre-render project`);
                    sleep.reject("Unable to pre-render project");
                });
                creator.on("progress", e => {
                    console.log(`Project pre-render: ${(e.percent * 100) >> 0}%`);
                });
                creator.on("complete", e => {
                    console.log(`Project pre-render ${slide.id} completed`);
                    index++;
                    render();
                });

            };

        };
    
        render();

    }
    catch(error) {
        sleep.reject(error);
    }

    return sleep.promise;

};

export { readProject, doesProjectExist, projectSlideRender };
