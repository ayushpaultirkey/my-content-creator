import chalk from "chalk";
import Project from "#service/frame/project.js";


/**
    *
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Delete(request, response) {

    // Create response body
    const _response = { message: "", success: false, data: {} };
    
    try {

        // Check for query strings and delete the
        // project folder
        const { pid } = request.query;
        if(!pid) {
            throw new Error("Invalid project id");
        };

        await Project.Delete({
            projectId: pid,
            callback: () => {

            }
        })

        // Set success response
        _response.success = true;

    }
    catch(error) {

        // Set error message
        console.log(chalk.red("/frame/project/delete:"), error);
        _response.message = error.message || "An error occurred";

    }
    finally {
        
        // Send response
        response.send(_response);

    };

};