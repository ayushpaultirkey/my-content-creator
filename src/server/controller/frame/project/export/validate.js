import chalk from "chalk";
import Export from "#service/frame/project/export.js";


/**
    *
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Validate(request, response) {
    
    // Create response body
    const _response = { message: "", success: false, url: "" };

    try {

        // Check for query strings
        const { pid } = request.query;
        if(!pid) {
            throw new Error("Invalid project id");
        };

        // Get the export file path of the project
        const _exportPath = await Export.GetFile(pid);

        // Set new response data
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