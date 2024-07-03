import Project from "#service/project.js";


/**
    *
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Get(request, response) {
    
    //Create project
    try {

        // Check if the query parameter are valid
        const { pid } = request.query;
        if(!pid) {
            throw new Error("Invalid project id");
        };

        // Get the export file path of the project
        const _file = await Project.Export.GetFile(pid);
        response.download(_file.path);

    }
    catch(error) {

        // Log and set response
        console.log("/project/export/download:", error);
        response.status(500);
        response.send("Failed to download file, check if the project is rendered");

    };

};