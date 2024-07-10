import chalk from "chalk";
import Export from "#service/frame/project/export.js";


/**
    *
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Validate(request, response) {
    
    // Create response object
    const _response = { message: "", success: false, url: "" };

    //Check if render.mp4 exists
    try {

        // Check if the query parameter are valid
        const { pid } = request.query;
        if(!pid) {
            throw new Error("Invalid project id");
        };

        // Get the export file path of the project
        const _exportPath = await Export.GetFile(pid);

        // Set response
        _response.success = true;
        _response.url = _exportPath.url;

    }
    catch(error) {

        // Log and set response
        console.log(chalk.red("/frame/project/export/validate:"), error);
        _response.message = "Export file not found, or error occured.";

    }
    finally {
        
        // Send response
        response.send(_response);

    };

};