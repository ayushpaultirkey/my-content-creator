import Project from "../../../service/project.js";


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

        // Check if the query parameter are valid
        const _projectId = request.query.pid;
        if((typeof(_projectId) !== "string" || _projectId.length < 2)) {
            throw new Error("Invalid project id");
        };

        // Get project data for comparing
        const _project = await Project.GetActive(_projectId);
        const _property = _project.property;

        // Check for title and description
        const _projectTitle = (typeof(request.query.ptitle) !== "string" || request.query.ptitle == _property.title || request.query.ptitle.length < 5) ? "" : `title to "${request.query.ptitle}",`;
        const _projectDetail = (typeof(request.query.pdetail) !== "string" || request.query.pdetail == _property.description || request.query.pdetail.length < 5) ? "" : `description to "${request.query.pdetail}",`;
        
        // Check if request contain audio asset id
        const _projectAudio = (request.query.paudio == null || !Array.isArray(request.query.paudio)) ? [] : request.query.paudio;

        // Check if the any asset is valid
        if(_projectTitle.length == 0 && _projectDetail.length == 0 && !_projectAudio && _projectAudio.length == 0) {

            // Nothing to update since any datat
            _response.message = "Nothing to update";
            _response.data = { id: _projectId, ... _project };

        }
        else {

            // Convert the audio id array to string
            const _audioPrompt = JSON.stringify(_projectAudio);
    
            // Update project data by using the prompt
            const _projectUpdated = await Project.Update(_projectId, `Change the project's ${_projectTitle} ${_projectDetail}`);
    
            // Update response body
            _response.message = "Project update";
            _response.data = { id: _projectId, ... _projectUpdated };
            
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