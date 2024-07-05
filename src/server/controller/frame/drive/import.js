import chalk from "chalk";
import Auth from "#service/google/auth.js";
import Drive from "#service/frame/drive.js";

/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Import(request, response) {
    
    //
    const _response = { message: "", success: false };

    //
    try {

        //
        if(!Auth.HasToken(request)) {
            throw new Error("Google account not authenticated");
        };

        //
        const { pid, fid } = request.query;
        if(!pid || !fid) {
            throw new Error("No project or file id is nor defined");
        };
        
        //
        await Drive.ImportFiles({
            fileId: JSON.parse(fid),
            projectId: pid, 
            callback: () => {

            }
        });

        // Set response data
        _response.success = true;
        
    }
    catch(error) {

        // Log error message
        console.log(chalk.red("/frame/drive/import:"), error);
        _response.message = error.message || "An error occurred";

    }
    finally {

        // Send response
        response.send(_response);

    };

};