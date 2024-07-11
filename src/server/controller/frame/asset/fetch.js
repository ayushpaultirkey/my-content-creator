import chalk from "chalk";
import Asset from "#service/asset.js";
import Project from "#service/frame/project.js";


/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Fetch(request, response) {

    // Create response body
    const _response = { message: "", success: false, data: [] };
    
    //
    try {

        // Check for query strings
        const { pid } = request.query;
        if(!pid) {
            throw new Error("Invalid project id");
        };

        // Get the list of assets from project
        const _asset = await Asset.GetAssets(Project.Path(pid, "/asset/"));

        // Set new response data
        _response.success = true;
        _response.data = _asset.map(x => {
            return {
                ... x,
                path: `/project/${pid}/asset/${x.name}`
            }
        });
        
    }
    catch(error) {

        // Log and ser error message
        _response.message = error.message || "Unable to get asset list";
        console.log(chalk.red("/frame/asset/fetch:"), error);

    }
    finally {

        // Send response
        response.send(_response);

    };

};