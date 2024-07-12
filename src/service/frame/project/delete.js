import path from "path";
import chalk from "chalk";
import fs from "fs/promises";
import Path from "./path.js";

export default async function Delete({ projectId = "", callback }) {

    try {
        
        // Log
        console.log(chalk.green("/S/Frame/Project/Delete(): Project deletion started"));

        // Check if the project id is valid and then remove
        // the project folder
        if(!projectId) {
            throw new Error("Expecting either prompt or file.");
        };
        
        fs.rm(Path(projectId), { recursive: true, force: true });

        // Log
        console.log(chalk.green("/S/Frame/Project/Delete(): Project deletion ended"));

        return true;

    }
    catch(error) {
        console.log(chalk.red("/S/Frame/Project/Delete():"), error);
        throw new Error("Unable to remove project");
    };
    
};