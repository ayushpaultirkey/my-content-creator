import { FetchAsset } from "../../service/asset.js";

/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Fetch(request, response) {

    //Create response object
    const _response = { message: "", success: false, data: [] };
    
    //Try fetch the assets
    try {

        // Check if the query parameter are valid
        const _projectId = request.query.pid;
        if((typeof(_projectId) !== "string" || _projectId.length < 2)) {
            throw new Error("Invalid project id");
        };

        // Get all asset list
        const _asset = await FetchAsset(_projectId);

        // Set success respones
        _response.success = true;
        _response.data = _asset;
        
    }
    catch(error) {

        // Set error message
        _response.message = error.message || "Unable to get asset list";
        
        // Log error message
        console.log("/asset/fetch:", error);

    }
    finally {

        // Send response
        response.send(_response);

    };

};