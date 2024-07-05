import fs from "fs/promises";
import chalk from "chalk";
import Path from "./path.js";

async function GetFile(projectId = "") {

    try {

        // Create path
        const _filePath = Path(projectId, "/render.mp4");
        
        // Try to access render.mp4 file
        await fs.access(_filePath);
      
        // Return the path of the export file
        return { path: _filePath, url: `/project/${projectId}/render.mp4` };

    }
    catch(error) {
        console.log(chalk.red("Service/Project/Export.GetFile():"), error);
        throw new Error("No files to export");
    };

};

export default { GetFile };