import Slide from "#service/frame/slide.js";
import Project from "#service/frame/project.js";


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

    //
    const _response = { message: "", success: false, data: {} };
    
    //
    try {
        
        //
        const { pid, sid, scontent, pimage, pvideo } = request.query;

        if(!pid || !sid) {
            throw new Error("Invalid project id or slide id");
        };

        //
        const _project = await Project.Read(pid);
        const _slide = _project.property.slides.find(x => x.id === sid);
        
        // Check if slide is valid
        if(!_slide) {
            throw new Error("Slide not found in project");
        };

        // Check slide's content
        const _slideContent = (typeof(scontent) !== "string" || scontent == _slide.content || scontent.length < 5) ? "" : `the content to "${scontent}",`;

        // Check if the image, video is valid and generate prompt for it
        const _slideImage = (pimage == null || !Array.isArray(pimage)) ? [] : pimage;
        const _slideVideo = (pvideo == null || !Array.isArray(pvideo)) ? [] : pvideo;

        const _imagePrompt = JSON.stringify(_slideImage);
        const _videoPrompt = JSON.stringify(_slideVideo);

        // Update slide by using the prompt
        const _projectUpdated = await Project.Update({
            projectId: pid,
            prompt: `In slide "${sid}" change ${_slideContent} the image to ${_imagePrompt} and the the video to ${_videoPrompt}`,
            callback: () => {

            }
        });

        // Update response body
        _response.success = true;
        _response.data = { id: pid, ... _projectUpdated };

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