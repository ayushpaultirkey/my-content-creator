import chalk from "chalk";
import Project from "#service/frame/project.js";


/**
    *
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Update(request, response) {

    // Create response body
    const _response = { message: "", success: false, data: {} };
    
    try {

        // Check for query strings
        const { pid, ptitle, pdetail, paudio } = request.query;
        if(!pid) {
            throw new Error("Invalid project id");
        };

        // Get project data
        const _project = await Project.Read(pid);
        const _property = _project.property;

        // Check if the query string data is valid
        const _projectAudio = (paudio == null || !Array.isArray(paudio)) ? [] : paudio;
        const _projectTitle = (typeof(ptitle) !== "string" || ptitle == _property.title || ptitle.length < 5) ? "" : `title to "${ptitle}",`;
        const _projectDetail = (typeof(pdetail) !== "string" || pdetail == _property.description || pdetail.length < 5) ? "" : `description to "${pdetail}",`;

        if(_projectTitle.length == 0 && _projectDetail.length == 0 && !_projectAudio && _projectAudio.length == 0) {

            // Set response data
            _response.message = "Nothing to update";
            _response.data = { id: pid, ... _project };

        }
        else {

            // Create audio prompt []
            const _audioPrompt = JSON.stringify(_projectAudio.map((x) => { return { name: x, effect: "" } }));
    
            // Update project using prompt
            const _projectUpdated = await Project.Update({
                projectId: pid,
                prompt: `Change the project's ${_projectTitle} ${_projectDetail} audio to ${_audioPrompt}`,
                file: undefined,
                callback: () => {
                    console.log("")
                }
            });
    
            // Update response body
            _response.message = "Project update";
            _response.data = { id: pid, ... _projectUpdated };
            
        };

        // Set success response
        _response.success = true;

    }
    catch(error) {

        // Set error message
        console.log(chalk.red("/frame/project/update:"), error);
        _response.message = error.message || "An error occurred";

    }
    finally {
        
        // Send response
        response.send(_response);

    };

};