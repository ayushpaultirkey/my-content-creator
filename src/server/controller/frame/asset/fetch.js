import chalk from "chalk";
import Asset from "#service/asset.js";
import Project from "#service/frame/project.js";


/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Fetch(request, response) {

    //
    const _response = { message: "", success: false, data: [] };
    
    //
    try {

        //
        const { pid } = request.query;
        if(!pid) {
            throw new Error("Invalid project id");
        };

        //
        const _asset = await Asset.GetAssets(Project.Path(pid, "/asset/"));

        //
        _response.success = true;
        _response.data = _asset.map(x => {
            return {
                ... x,
                path: `/project/${pid}/asset/${x.name}`
            }
        });
        
    }
    catch(error) {

        // Set error message
        _response.message = error.message || "Unable to get asset list";
        console.log(chalk.red("/frame/asset/fetch:"), error);

    }
    finally {

        // Send response
        response.send(_response);

    };

};