import fs from "fs/promises";
import path from "path";

import Project from "#service/project.js";

async function GetFile(projectId = "") {

    try {

        // Create path
        const _filePath = path.join(Project.Path(projectId), "/render.mp4");
        
        // Try to access render.mp4 file
        await fs.access(_filePath);
      
        // Return the path of the export file
        return { path: _filePath, url: `/project/${projectId}/render.mp4` };

    }
    catch(error) {
        console.log("Service/Project/Export.GetFileGet():", error);
        throw error;
    };

};

export default { GetFile };