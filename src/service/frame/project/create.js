import fs from "fs/promises";
import path from "path";
import chalk from "chalk";
import crypto from "crypto";

import Path from "./path.js";
import Exist from "./exist.js";
import Slide from "../slide.js";
import Asset from "../../asset.js";
import Config from "./../@config.js";
import Gemini from "../../google/gemini.js";


export default async function Create({ prompt, file, width = 128, height = 128, callback }) {

    //
    console.log(chalk.green("/S/Frame/Project/Create():"), "Project creation started");

    try {

        //
        const _projectId = crypto.randomUUID();

        //
        if(await Exist(_projectId)) {
            throw new Error("Project already exists");
        };
        
        //
        let _history = [];
        if(file) {

            //
            console.log(chalk.yellow("/S/Frame/Project/Create():"), "File found, adding multimodel prompt");
            callback("Project: Creating multi model prompt");

            //
            await Gemini.PromptFile(Config.E_GEMINI, file, _history);

        };

        //
        console.log(chalk.green("/S/Frame/Project/Create():"), "Prompt started");
        callback("Project: Generating response");

        //
        const _answer = await Gemini.Prompt(Config.E_GEMINI, prompt, _history);
        const _parsed = JSON.parse(_answer.answer);
        const _project = {
            config: {
                width: width * 1,
                height: height * 1
            },
            property: _parsed,
            history: _history,
        };

        //
        console.log(chalk.green("/S/Frame/Project/Create():"), "Prompt ended");
        callback("Project: Creating project");

        //
        const _projectPath = Path(_projectId);
        await fs.mkdir(_projectPath, { recursive: true });
        await fs.mkdir(path.join(_projectPath, "/asset"), { recursive: true });
        await fs.mkdir(path.join(_projectPath, "/cache"), { recursive: true });
        await fs.writeFile(path.join(_projectPath, "/project.json"), JSON.stringify(_project));

        //
        await Asset.CreateVoiceAsset({
            content: _parsed.slides.map(x => ({
                text: x.content,
                destination: path.join(_projectPath, `/asset/${x.id}.wav`)
            })),
            callback: callback,
            useLocalTTS: true,
        });

        //
        const _outImage = _parsed.slides.flatMap(x =>
            x.image
            .filter(y => (y.name && y.name.length > 3))
            .map(y => path.join(_projectPath, "/asset/", y.name))
        );
        const _inImage = await Asset.FetchExternalImage({
            keyword: _parsed.keyword,
            count: _outImage.length,
            callback: callback
        });

        //
        console.log(chalk.yellow("/S/Frame/Project/Create():"), "INPUT IMAGE", _inImage);
        console.log(chalk.yellow("/S/Frame/Project/Create():"), "OUTPUT IMAGE", _outImage);

        //
        await Asset.CropImages({
            input: _inImage,
            output: _outImage,
            width: width,
            height: height
        });

        //
        await Slide.Render({
            slide: _parsed.slides,
            root: _projectPath,
            width: width,
            height: height,
            callback: callback
        });

        //
        console.log(chalk.green("/S/Frame/Project/Create():"), "Project created", _projectId);
        callback("Project: Project created");

        //
        return { ... _project, id: _projectId };

    }
    catch(error) {
        console.log(chalk.red("/S/Frame/Project/Create():"), error);
        throw new Error("Unable to create project");
    };

}