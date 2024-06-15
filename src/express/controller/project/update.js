import path from "path";
import fs from "fs/promises";
import _ from "lodash";
import directory from "../../../library/directory.js";
import wait from "../../service/wait.js";
import { projectSlideRender } from "../../service/project.js";

// Function to find updated slides
const findUpdatedSlides = (originalSlides, newSlides) => {

    const updates = {
        updated: [],
        removed: [],
        added: []
    };
    
      // Create a map of original slides by id for quick lookup
      const originalMap = new Map(originalSlides.map(slide => [slide.id, slide]));
    
      // Check for updates and additions
      newSlides.forEach(newSlide => {
            const originalSlide = originalMap.get(newSlide.id);
            if (originalSlide) {
                // Check if content has changed
                if(JSON.stringify(originalSlide) !== JSON.stringify(newSlide)) {
                    updates.updated.push(newSlide);
                };
                // Remove from map to keep track of remaining slides
                originalMap.delete(newSlide.id);
            }
            else {
                updates.added.push(newSlide);
            }
      });
    
      // Remaining slides in originalMap are considered removed
      updates.removed = Array.from(originalMap.values());
    
      return updates;

};

/**
    * Reads project file
    * @param {string} dir
    * @returns {Promise<object>}
*/
async function readJsonFile(dir = "") {
    try {
        const fileContent = await fs.readFile(dir, "utf8");
        return JSON.parse(fileContent);
    }
    catch (error) {
        throw new Error(`Failed to read or parse json file`);
    };
};


/**
    * Checks if project exists at given path
    * @param {string} dir
*/
async function directoryExist(dir = "") {
    try {
        await fs.access(dir);
        return true;
    }
    catch(error) {
        if(error.code === "ENOENT") {
            return false;
        }
        else {
            throw error;
        };
    };
};

/**
    * Validates project IDs from request query
    * @param {import("express").Request} req 
    * @param {import("express").Response} res 
*/
async function update(request, response) {

    // Create response body
    const responseBody = { message: "", success: false, data: {} };
    
    //
    try {

        // Get current directory path and filename
        const { __dirname } = directory();

        // Check if the query parameter are valid
        const projectId = request.query.id;
        const projectSlideId = request.query.slideid;
        const newContent = request.query.content;
        if(
            (typeof(projectId) !== "string" || projectId.length < 2) ||
            (typeof(projectSlideId) !== "string" || projectSlideId.length < 2) ||
            (typeof(newContent) !== "string" || newContent.length < 2)
        ) {
            throw new Error("Invalid project slide parameter");
        };

        // Generate project path and check if it exists
        const projectPath = path.join(__dirname, `../../public/project/${projectId}`);
        const projectExist = await directoryExist(projectPath);

        // If project exists then set response value
        if(projectExist) {

            let projectContentOriginal = await readJsonFile(path.join(projectPath, "/project.json"));
            let projectContentUpdated = _.cloneDeep(projectContentOriginal);
            
            for(var i = 0; i < projectContentUpdated.data.slide.length; i++) {
                if(projectContentUpdated.data.slide[i].id == projectSlideId) {
                    projectContentUpdated.data.slide[i].content = newContent;
                    break;
                };
            };

            const projectUpdate = findUpdatedSlides(projectContentOriginal.data.slide, projectContentUpdated.data.slide);
            await projectSlideRender(projectId, projectUpdate.updated.concat(projectUpdate.added));

            //
            await fs.writeFile(path.join(projectPath, "/project.json"), JSON.stringify({
                "prompt": [ ... projectContentOriginal.prompt ],
                "config": { ... projectContentOriginal.config },
                "data": { ... projectContentUpdated.data }
            }));

            // Set success response
            responseBody.success = true;
            responseBody.data = {
                "prompt": [ ... projectContentOriginal.prompt ],
                "config": { ... projectContentOriginal.config },
                "data": { ... projectContentUpdated.data }
            };

        };

    }
    catch(error) {

        // Set error message
        responseBody.message = error.message || "An error occurred";

    }
    finally {
        
        // Send response
        response.send(responseBody);

    };

};

export default update;