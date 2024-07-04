import fs from "fs/promises";
import Path from "./path.js";


export default async function Exist(projectId = "") {

    try {

        // Check if the project file exists ?
        const _projectPath = Path(projectId, "/project.json");
        await fs.access(_projectPath);

        return true;
        
    }
    catch(error) {
        if(error.code === "ENOENT") {
            return false;
        }
        else {
            console.log("Service/Project.Exist():", error);
            throw new Error("Project file not found");
        };
    };

}