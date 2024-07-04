import fs from "fs/promises";
import Path from "./path.js";


export default async function Save(projectId, data) {

    try {

        //
        if(!projectId || !data) {
            throw new Error("Invalid project id or data");
        };
        
        //
        const _projectPath = Path(projectId, "/project.json");
        const _content = JSON.stringify(data);

        //
        await fs.writeFile(_projectPath, _content);

        //
        console.log("Service/Project.Save(): Project data saved");

    }
    catch(error) {
        console.log("Service/Project.Save():", error);
        throw new Error("Unable to save project file");
    };

}