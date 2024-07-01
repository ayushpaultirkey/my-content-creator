import Slide from "../../../service/slide.js";
import Project from "../../../service/project.js";


/**
    * 
    * @param {*} value 
    * @returns 
*/
function IsValid(value = []) {
    for(var i = 0, l = value.length; i < l; i++) {
        if((typeof(value[i]) !== "string" || value[i].length < 2)) {
            return false;
        };
    };
    return true;
};


/**
    * Validates project IDs from request query
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Update(request, response) {

    // Create response body
    const _response = { message: "", success: false, data: {} };
    
    // Try and update the slide's content using geenrative ai
    try {

        // Check if the query parameter are valid
        const _projectId = request.query.pid;
        const _slideId = request.query.sid;

        if((typeof(_projectId) !== "string" || _projectId.length < 2) || (typeof(_slideId) !== "string" || _slideId.length < 2)) {
            throw new Error("Invalid project id or slide id");
        };

        // Get project data for comparing
        const _project = await Project.GetActive(_projectId);
        const _slide = _project.property.slides.find(x => x.id === _slideId);
        
        // Check if slide is valid
        if(!_slide) {
            throw new Error("Slide not found in project");
        };

        // Check slide's content
        const _slideContent = (typeof(request.query.scontent) !== "string" || request.query.scontent == _slide.content || request.query.scontent.length < 5) ? "" : `the content to "${request.query.scontent}",`;

        // Check if the image, video is valid and generate prompt for it
        const _slideImage = (request.query.pimage == null || !Array.isArray(request.query.pimage)) ? [] : request.query.pimage;
        const _slideVideo = (request.query.pvideo == null || !Array.isArray(request.query.pvideo)) ? [] : request.query.pvideo;

        const _imagePrompt = JSON.stringify(_slideImage);
        const _videoPrompt = JSON.stringify(_slideVideo);

        // Update slide by using the prompt
        const _projectUpdated = await Project.Update(_projectId, `In slide "${_slideId}" change ${_slideContent} the image to ${_imagePrompt} and the the video to ${_videoPrompt}`);

        // Update response body
        _response.success = true;
        _response.data = { id: _projectId, ... _projectUpdated };

    }
    catch(error) {

        // Set error message
        _response.message = error.message || "An error occurred";

        // Log error message
        console.log("/slide/update:", error);

    }
    finally {
        
        // Send response
        response.send(_response);

    };

};