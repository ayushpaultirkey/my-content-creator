import Slide from "./../slide.js";
import Asset from "./../asset.js";
import Project from "../project.js";
import Gemini from "./../google/gemini.js";


export default async function Update(projectId = "", prompt = "", file = null) {

    // Log
    console.log("Service/Project/Update(): Project update started");

    // Try and update project
    try {

        // Check if prompt or file is valid
        if(!prompt && !file) {
            throw new Error("Service/Project/Update(): Expecting either prompt or file.");
        };
    
        // Get project data and history for prompting
        const _project = await Project.GetActive(projectId);
        const _history = _project.history;
        
        // Check if file is valid then use multi model prompt
        if(file) {
            console.log("Service/Project/Update(): File found, adding multimodel prompt");
            await Gemini.PromptFile(file, _history);
        };

        // Generative run
        const _answer = await Gemini.Prompt(prompt, _project.history);
        
        // Get modified slides to render only those
        const _slide = Slide.CompareModified(_project.property.slides, _answer.response.slides);
        const _slideUpdated = _slide.updated.concat(_slide.added);

        // Create updated project
        const _projectUpdated = {
            config: { ... _project.config },
            property: { ... _answer.response },
            history: _answer.history
        };

        // Update active project
        Project.UpdateActive(_projectUpdated);

        // Create audio and render the slides
        await Asset.CreateVoiceAsset(projectId, _slideUpdated);
        await Slide.Render(projectId, _slideUpdated);

        // Log
        console.log("Service/Project/Update(): Project update ended");

        // Update project file
        await Project.Save(projectId, _projectUpdated);

        // Return new project
        return _projectUpdated;

    }
    catch(error) {
        console.log("Service/Project/Update():", error);
        throw error;
    };
    
};