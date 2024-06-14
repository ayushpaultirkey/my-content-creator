import path from "path";
import fs from "fs/promises";
import directory from "../../../library/directory.js";

/**
    * Reads project file
    * @param {string} dir
    * @returns {Promise<object>}
*/
async function readJsonFile(dir = "") {
    try {
        const fileContent = await fs.readFile(dir, 'utf8');
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
async function directoryExists(dir = "") {
    try {
        await fs.access(dir);
        return true;
    }
    catch(error) {
        if(error.code === 'ENOENT') {
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
async function validate(request, response) {

    //Create response object
    const responseBody = { message: "", success: false, data: [] };
    
    //Create project
    try {

        // Get current directory path and filename
        const { __dirname } = directory();

        // Check if the query parameter are valid
        const projectIds = JSON.parse(request.query.pid);
        if(projectIds == null || !Array.isArray(projectIds)) {
            throw new Error("No project IDs provided");
        };

        // Validate each project ID
        for(const projectId of projectIds) {
            if(typeof projectId !== "string" || projectId.length < 2) {
                throw new Error(`Invalid project ID: ${projectId}`);
            };
        };

        // Validate each project ID
        for(const projectId of projectIds) {

            // Generate project path and check if it exists
            const projectPath = path.join(__dirname, `../../public/project/${projectId}`);
            const projectExists = await directoryExists(projectPath);

            // If project exists then set response value
            if(projectExists) {

                const projectContent = await readJsonFile(path.join(projectPath, "/project.json"));
                responseBody.data.push({ id: projectId, ... projectContent });

            };

        };

        // Set success response
        responseBody.success = true;
        
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

export default validate;