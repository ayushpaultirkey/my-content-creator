import Project from "#service/frame/project.js";


/**
    * Validates project IDs from request query
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Update(request, response) {

    // Create response body
    const _response = { message: "", success: false, data: {} };
    
    //
    try {

        //
        const { pid, ptitle, pdetail, paudio } = request.query;
        if(!pid) {
            throw new Error("Invalid project id");
        };

        //
        const _project = await Project.Read(pid);
        const _property = _project.property;

        //
        const _projectAudio = (paudio == null || !Array.isArray(paudio)) ? [] : paudio;
        const _projectTitle = (typeof(ptitle) !== "string" || ptitle == _property.title || ptitle.length < 5) ? "" : `title to "${ptitle}",`;
        const _projectDetail = (typeof(pdetail) !== "string" || pdetail == _property.description || pdetail.length < 5) ? "" : `description to "${pdetail}",`;

        //
        if(_projectTitle.length == 0 && _projectDetail.length == 0 && !_projectAudio && _projectAudio.length == 0) {

            //
            _response.message = "Nothing to update";
            _response.data = { id: pid, ... _project };

        }
        else {

            //
            const _audioPrompt = JSON.stringify(_projectAudio);
    
            //
            const _projectUpdated = await Project.Update({
                projectId: pid,
                prompt: `Change the project's ${_projectTitle} ${_projectDetail}`,
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
        _response.message = error.message || "An error occurred";

        // Log error message
        console.log("/project/update:", error);

    }
    finally {
        
        // Send response
        response.send(_response);

    };

};