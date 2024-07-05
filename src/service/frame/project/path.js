import path from "path";
import directory from "#library/directory.js";

/**
 * 
 * @param {*} projectId 
 * @param {"asset"} other 
 * @returns 
 */
export default function Path(projectId = "", other = "") {

    // Check for project id
    if(typeof(projectId) !== "string") {
        throw new Error("Service/Project.Path(): Invalid project id");
    };

    // Get project path
    const { __root } = directory();
    return path.join(__root, `/project/${projectId}/`, other);

};

