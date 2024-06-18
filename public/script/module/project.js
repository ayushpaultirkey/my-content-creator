async function getProjectList() {

    try {

        const _project = localStorage.getItem("PROJECT");
        if(!_project) {
            return [];
        };

        const _projectData = JSON.parse(_project);
        const _projectId = [];

        _projectData.forEach(project => {
            _projectId.push(project.id);
        });
        
        const _request = await fetch(`/api/project/validate?pid=${JSON.stringify(_projectId)}`);
        const _response = await _request.json();

        if(!_response.success) {
            return [];
        };

        return _response.data;
        
    }
    catch (error) {
        console.error("Error retrieving project list:", error);
        return null;
    }

};

async function setProjectList(project = {}) {

    try {
        let _project = await getProjectList();
        if(_project == null) {
            _project = [];
        };
        _project.push(project);
        localStorage.setItem("PROJECT", JSON.stringify(_project));
    }
    catch (error) {
        console.error("Error while adding to project list:", error);
        return false;
    }

}


function ProjectIsValid(project) {
    return !(!project || typeof(project) === "undefined");
}

export { getProjectList, setProjectList, ProjectIsValid }