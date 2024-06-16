import path from "path";
import fs from "fs/promises";
import _ from "lodash";
import directory from "../../../library/directory.js";
import { ReadProject, doesProjectExist, readProject } from "../../service/project.js";
import { UpdateSlideByProperty, findUpdatedSlides, renderSlides } from "../../service/slide.js";

/**
    * Validates project IDs from request query
    * @param {import("express").Request} req 
    * @param {import("express").Response} res 
*/
async function Update(request, response) {

    // Create response body
    const _response = { message: "", success: false, data: {} };
    
    //
    try {

        // Get current directory path and filename
        // const { __dirname } = directory();

        // Check if the query parameter are valid
        const _projectId = request.query.pid;
        const _slideId = request.query.sid;
        const _slideContent = request.query.scontent;

        // Check if the query parameter are valid
        if(
            (typeof(_projectId) !== "string" || _projectId.length < 2) ||
            (typeof(_slideId) !== "string" || _slideId.length < 2) ||
            (typeof(_slideContent) !== "string" || _slideContent.length < 2)
        ) {
            throw new Error("Invalid project slide parameter");
        };

        // Update slide by using the property
        await UpdateSlideByProperty(_projectId, [{ id: _slideId, content: _slideContent }]);

        // Update response body
        _response.success = true;


        // Generate project path and check if it exists
        // const projectPath = path.join(__dirname, `../../public/project/${_projectId}`);
        // const projectExist = await doesProjectExist(_projectId);

        // If project exists then set response value
        // if(projectExist) {

        //     let projectContentOriginal = await readProject(_projectId);
        //     let projectContentUpdated = _.cloneDeep(projectContentOriginal);
            
        //     for(var i = 0; i < projectContentUpdated.data.slide.length; i++) {
        //         if(projectContentUpdated.data.slide[i].id == _slideId) {
        //             projectContentUpdated.data.slide[i].content = _slideContent;
        //             break;
        //         };
        //     };

        //     //
        //     const projectUpdate = findUpdatedSlides(projectContentOriginal.data.slide, projectContentUpdated.data.slide);
        //     await renderSlides(_projectId, projectUpdate.updated.concat(projectUpdate.added));

        //     //
        //     const projectUpdated = {
        //         "prompt": [ ... projectContentOriginal.prompt ],
        //         "config": { ... projectContentOriginal.config },
        //         "data": { ... projectContentUpdated.data }
        //     }

        //     //
        //     await fs.writeFile(path.join(projectPath, "/project.json"), JSON.stringify(projectUpdated));

        //     // Set success response
        //     _response.success = true;
        //     //_response.data = projectUpdated;

        // };

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

export default Update;