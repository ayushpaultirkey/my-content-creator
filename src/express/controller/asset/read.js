import { GetAssetList } from "../../service/asset.js";



/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Read(request, response) {

    //Create response object
    const _response = { message: "", success: false, data: [] };
    
    //Try and run prompt
    try {

        // Check if the query parameter are valid
        const _projectId = request.query.pid;
        if((typeof(_projectId) !== "string" || _projectId.length < 2)) {
            throw new Error("Invalid parameters");
        };

        //
        const _asset = await GetAssetList(_projectId);

        // Set success respones
        _response.success = true;
        _response.data = _asset;
        
    }
    catch(error) {

        // Set error message
        _response.message = error.message || "An error occurred";

    }
    finally {

        // Send response
        response.send(_response);

    };

};