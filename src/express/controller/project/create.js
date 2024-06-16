import path from "path";
import crypto from "crypto";
import fs from "fs/promises";
import directory from "../../../library/directory.js";
import { FFScene, FFText, FFVideo, FFAlbum, FFImage, FFCreator, FFAudio } from "ffcreator";
import { CreateProject } from "../../service/project.js";



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

        // Check if the query parameter are valid
        const _prompt = request.query.prompt;
        if(typeof(_prompt) == "undefined" || _prompt.length < 2) {
            throw new Error("No project description provided");
        };

        // Generate random id
        const _projectId = crypto.randomUUID();

        // Create new project
        await CreateProject(_projectId, {
            prompt: [
                { "sender": "user", "content": "Can you help me in generate a video content for health and fitness, the video length is around 1 minute" },
                { "sender": "ai", "content": "sure" }
            ],
            config: {
                width: 720,
                height: 1280
            },
            data: {
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
            }
        });

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