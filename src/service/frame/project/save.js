import fs from "fs/promises";
import chalk from "chalk";
import Path from "./path.js";


export default async function Save(projectId, data) {

    try {

        // Check if the project is valid and get the content
        // and its path
        if(!projectId || !data) {
            throw new Error("Invalid project id or data");
        };
        
        const _projectPath = Path(projectId, "/project.json");
        const _content = JSON.stringify(data);

        await fs.writeFile(_projectPath, _content);

        console.log(chalk.green("/S/Frame/Project/Save():"), "Project data saved");

    }
    catch(error) {
        console.log(chalk.red("/S/Frame/Project/Save():"), error);
        throw new Error("Unable to save project file");
    };

}