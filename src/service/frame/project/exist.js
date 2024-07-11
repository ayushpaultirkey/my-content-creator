import fs from "fs/promises";
import chalk from "chalk";
import Path from "./path.js";


export default async function Exist(projectId = "") {
    try {

        const _projectPath = Path(projectId, "/project.json");
        await fs.access(_projectPath);

        return true;
        
    }
    catch(error) {
        if(error.code === "ENOENT") {
            return false;
        }
        else {
            console.log(chalk.red("/S/Frame/Project/Exist():"), error);
            throw new Error("Project file not found");
        };
    };
}