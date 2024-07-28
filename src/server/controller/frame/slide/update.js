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
        const { pid, sid, scontent, pimage, pvideo } = request.query;
        if(!pid || !sid) {
            throw new Error("Invalid project id or slide id");
        };

        // Read project data and it's slides
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

        const _imagePrompt = JSON.stringify(_slideImage.map((x) => { return { name: x, effect: "" } }));
        const _videoPrompt = JSON.stringify(_slideVideo.map((x) => { return { name: x, effect: "" } }));

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
        console.log(chalk.red("/frame/slide/update:"), error);

    }
    finally {
        
        // Send response
        response.send(_response);

    };

};