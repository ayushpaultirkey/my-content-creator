import fs from "fs/promises";
import chalk from "chalk";
import Path from "./path.js";


async function GetFile(projectId = "") {
    try {

        const _filePath = Path(projectId, "/render.mp4");
        
        await fs.access(_filePath);
      
        return { path: _filePath, url: `/project/${projectId}/render.mp4` };

    }
    catch(error) {
        console.log(chalk.red("/S/Frame/Project/Export.GetFile():"), error);
        throw new Error("No files to export");
    };
};

export default { GetFile };