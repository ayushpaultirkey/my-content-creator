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
        
        // Check if the image, video and audio is valid and generate prompt for it
        const _projectImage = (request.query.pimage == null || !Array.isArray(request.query.pimage)) ? [] : request.query.pimage;
        const _projectVideo = (request.query.pvideo == null || !Array.isArray(request.query.pvideo)) ? [] : request.query.pvideo;
        const _projectAudio = (request.query.paudio == null || !Array.isArray(request.query.paudio)) ? [] : request.query.paudio;

        const _imagePrompt = JSON.stringify(_projectImage);
        const _videoPrompt = JSON.stringify(_projectVideo);
        const _audioPrompt = JSON.stringify(_projectAudio);

        // Update project data by using the prompt
        const _projectUpdated = await Project.Update(_projectId, `Change the project's ${_projectTitle} ${_projectDetail} background image to ${_imagePrompt}, background video to ${_videoPrompt} and background audio to ${_audioPrompt}`);

        // Update response body
        _response.success = true;
        _response.data = { id: _projectId, ... _projectUpdated };

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