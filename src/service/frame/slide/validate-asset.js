import path from "path";
import chalk from "chalk";
import fs from "fs/promises";

import Path from "./../project/path.js";

export default async function ValidateAsset(projectId, firstSlide, newSlide = []) {

    try {

        const _projectPath = Path(projectId);

        if(!firstSlide || !firstSlide.image || !firstSlide.image[0].name) {
            throw new Error("Invalid first slide");
        };

        for(var i = 0, len = newSlide.length; i < len; i++) {
                
            if(!newSlide[i].image || !newSlide[i].image[0] || !newSlide[i].image[0].name) {
                continue;
            };

            const _oPath = path.join(_projectPath, "/asset/", firstSlide.image[0].name);
            const _nPath = path.join(_projectPath, "/asset/", newSlide[i].image[0].name);

            await fs.copyFile(_oPath, _nPath);

            //
            console.log(chalk.green("S/Frame/Slide/ValidateAsset():"), `New asset created for slide ${newSlide[i].id}`);
            
        };
    }
    catch(error) {
        console.log(chalk.red("S/Frame/Project/ValidateAsset():"), error);
    };

};