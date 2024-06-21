import { UpdateSlide } from "../../service/slide.js";


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
        const _slideContent = request.query.scontent;

        // Check if the query parameter are valid
        if(!IsValid([_projectId, _slideId, _slideContent])){
            throw new Error("Invalid project slide parameter");
        };

        // Check if the image and video is valid and generate prompt for it
        const _slideImage = (request.query.pimage == null || !Array.isArray(request.query.pimage)) ? [] : request.query.pimage;
        const _slideVideo = (request.query.pvideo == null || !Array.isArray(request.query.pvideo)) ? [] : request.query.pvideo;

        const _image = _slideImage.map(x => ({ name: x }));
        const _video = _slideVideo.map(x => ({ name: x }));

        const _imagePrompt = JSON.stringify(_image);
        const _videoPrompt = JSON.stringify(_video);

        // Update slide by using the prompt
        const _project = await UpdateSlide(_projectId, `In slide "${_slideId}" change the content to "${_slideContent}", it's image to ${_imagePrompt} and the video to ${_videoPrompt}`);

        // Update response body
        _response.success = true;
        _response.data = { id: _projectId, ... _project };

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