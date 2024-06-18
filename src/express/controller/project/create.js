import path from "path";
import crypto from "crypto";
import fs from "fs/promises";
import directory from "../../../library/directory.js";
import { FFScene, FFText, FFVideo, FFAlbum, FFImage, FFCreator, FFAudio } from "ffcreator";
import { CreateProject } from "../../service/project.js";
import { GenerativeRun } from "../../service/gemini.js";



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

        // Generative run
        const _answer = await GenerativeRun(_prompt);

        // Create new project
        await CreateProject(_projectId, {
            config: {
                width: 720,
                height: 1280
            },
            property: _answer.response,
            session: { context: _answer.context }
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