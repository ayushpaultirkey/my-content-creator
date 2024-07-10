import fs from "fs/promises";
import Path from "./path.js";
import chalk from "chalk";


export default async function Read(projectId = "") {

    try {

        //
        const _projectPath = Path(projectId, "/project.json");
        const _content = await fs.readFile(_projectPath, "utf8");

        // Parse json
        const _json = JSON.parse(_content);

        // Export the json file
        return _json;

    }
    catch(error) {
        console.log(chalk.red("/S/Frame/Project/Read():"), error);
        throw new Error("Unable to read project file");
    };

}