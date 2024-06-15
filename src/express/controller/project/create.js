import path from "path";
import crypto from "crypto";
import fs from "fs/promises";
import directory from "../../../library/directory.js";
import { FFScene, FFText, FFVideo, FFAlbum, FFImage, FFCreator, FFAudio } from "ffcreator";

class Async {
    constructor() {
        this.Reject = null;
        this.Resolve = null;
        this.Promise = new Promise((res, rej) => {
            this.Resolve = res;
            this.Reject = rej;
        });
    }
};


async function projectPreRender(projectPath = "", data = {}) {

    // Create new promise
    const promise = new Async();

    // Get current directory path and filename
    const { __dirname } = directory();
    FFCreator.setFFmpegPath(path.join(__dirname, "./../../library/ffmpeg/bin/ffmpeg.exe"));
    FFCreator.setFFprobePath(path.join(__dirname, "./../../library/ffmpeg/bin/ffprobe.exe"));

    // Set video dimension
    const S = 1;
    const W = 720 / S;
    const H = 1280 / S;

    // Render for all slides into separate files
    let index = 0;
    let length = data.slide.length;
    const render = () => {
        if(index > length - 1) {

            console.log("Project pre-render completed");
            promise.Resolve();

        }
        else {

            //
            const creator = new FFCreator({
                width: W,
                height: H
            });
                
            //
            const scene = new FFScene();
            scene.setBgColor("#000000");
            scene.setDuration(data.slide[index].time);
            scene.setTransition("GridFlip", 2);
            creator.addChild(scene);

            //
            const text = new FFText({
                text: data.slide[index].content,
                x: W / 2,
                y: H / 2,
            });
            text.setColor("#ffffff");
            text.addEffect("zoomIn", 1, 0);
            text.addEffect("fadeOut", 1, data.slide[index].hideAt - data.slide[index].showAt);
            text.alignCenter();
            text.setWrap(W / 1.5);
            scene.addChild(text);

            //
            creator.output(path.join(projectPath, `./cache/${data.slide[index].id}.mp4`));
            creator.start();
            creator.closeLog();

            //
            creator.on("start", () => {
                console.log(`Project pre-render started`);
            });
            creator.on("error", e => {
                console.log(`Unable to pre-render project`);
                promise.Reject();
            });
            creator.on("progress", e => {
                console.log(`Project pre-render: ${(e.percent * 100) >> 0}%`);
            });
            creator.on("complete", e => {
                console.log(`Project pre-render ${index} completed`);
                index++;
                render();
            });

        };
    };
    render();


    return promise.Promise;

};


/**
    * 
    * @param {string} projectPath
*/
async function makeProject(projectPath = "") {
    try {
        await fs.access(projectPath);
        throw new Error("Project already exists");
    }
    catch(error) {
        if(error.code === "ENOENT") {

            const data = {
                "title": "3 Easy Exercises for a Stronger Core",
                "totalTime": 60,
                "slide": [
                    {
                        "id": "slide-1",
                        "content": "Want a stronger core without fancy gym equipment? Try these 3 simple exercises!",
                        "time": 5,
                        "showAt": 0,
                        "hideAt": 5
                    },
                    {
                        "id": "slide-2",
                        "content": "**1. Plank:**  Get into a push-up position, but rest on your forearms. Engage your core, hold for 30 seconds, and repeat 3 times.",
                        "time": 10,
                        "showAt": 5,
                        "hideAt": 15
                    },
                    {
                        "id": "slide-3",
                        "content": "**2. Bird Dog:**  Start on all fours. Extend one arm forward and the opposite leg back, keeping your core tight. Hold for 5 seconds, switch sides, and repeat 10 times.",
                        "time": 15,
                        "showAt": 15,
                        "hideAt": 30
                    },
                    {
                        "id": "slide-4",
                        "content": "**3. Bicycle Crunches:** Lie on your back with knees bent. Alternate bringing each elbow to the opposite knee, twisting your torso. Do 15-20 reps.",
                        "time": 15,
                        "showAt": 30,
                        "hideAt": 45
                    },
                    {
                        "id": "slide-5",
                        "content": "Consistency is key! Try these exercises 2-3 times a week to see results.",
                        "time": 5,
                        "showAt": 45,
                        "hideAt": 60
                    }
                ]
            };

            await fs.mkdir(projectPath, { recursive: true });
            await fs.writeFile(path.join(projectPath, "/project.json"), JSON.stringify({
                prompt: [
                    { "sender": "user", "content": "Can you help me in generate a video content for health and fitness, the video length is around 1 minute" },
                    { "sender": "ai", "content": "sure" }
                ],
                config: {
                    width: 720,
                    height: 1280
                },
                data: data
            }));
            await projectPreRender(projectPath, data);

            console.log("Project folder created");

        }
        else {
            throw error;
        };
    };
};


/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
async function Create(request, response) {

    //Create response object
    const _response = { message: "", success: false, pid: "" };
    
    //Create project
    try {

        // Get current directory path and filename
        const { __dirname } = directory();

        // Check if the query parameter are valid
        const _projectPrompt = request.query.prompt;
        if(typeof(_projectPrompt) == "undefined" || _projectPrompt.length < 2) {
            throw new Error("No project description provided");
        };

        // Generate random id
        const _projectId = crypto.randomUUID();
        const _projectPath = path.join(__dirname, `../../public/project/${_projectId}`);

        // Check if the project directory exists and create if it doesn"t
        await makeProject(_projectPath);

        // Set success respones
        _response.success = true;
        _response.pid = _projectId;
        _response.message = "Project created successfully";
        
    }
    catch(error) {
        _response.message = error.message || "An error occurred";
    }
    finally {
        response.send(_response);
    };

};


//
export default Create;