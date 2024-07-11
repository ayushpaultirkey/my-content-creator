import chalk from "chalk";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

import Drive from "#service/google/drive.js";
import Project from "#service/frame/project.js";

export default async function ImportFiles({ projectId = "", fileId = [], request, callback }) {

    try {

        // Check if the project is valid
        if(!projectId || !fileId) {
            throw new Error("No project or file id is not defined");
        };

        callback("Project: Importing file");

        // Get project data and its path
        const _project = await Project.Read(projectId);
        const _projectAsset = Project.Path(projectId, "/asset/");

        // Import the file to google drive
        const _files = await Drive.ImportFiles({
            id: fileId,
            request: request,
            callback: callback
        });

        // After importing copy the file to project folder
        for(var i = 0, len = _files.length; i < len; i++) {

            const { name, path: fpath, mime } = _files[i];
            const _destination = path.join(_projectAsset, name);

            // If the file is image then crop it according
            // to video resolution
            if(mime.startsWith("image/")) {

                await sharp(fpath)
                .resize({
                    width: (_project.config.width * 1),
                    height: (_project.config.height * 1),
                    fit: "cover"
                })
                .toFile(_destination);

            }
            else {

                await fs.copyFile(fpath, _destination);

            };

        };
        
        console.log(chalk.green("/S/Frame/Drive/Import():"), "Files imported");

    }
    catch(error) {
        console.log(chalk.red("/S/Frame/Drive/Import():"), error);
        throw new Error("Unable to import file");
    };

}