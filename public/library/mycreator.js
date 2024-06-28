
const Project = {
    GetLocal: function() {

        try {

            // Get local project
            const _project = localStorage.getItem("PROJECT");
            
            // Return the project
            return JSON.parse(_project);

        }
        catch(error) {
            console.log("Library/Project/GetLocal(): ", error);
            return [];
        }

    },
    GetValidated: async function(update = true) {

        try {

            // Get local project
            const _projectId = this.GetLocal();

            // Validate each project by their id
            const _request = await fetch(`/api/project/validate?pid=${JSON.stringify(_projectId)}`);
            const _response = await _request.json();
    
            // Check if success
            if(!_response.success) {
                return [];
            };
    
            // Update local project
            if(update) {

                // Get Response dat
                const _validId = [];
                const _project = _response.data;
                for(var i = 0; i < _project.length; i++) {
                    _validId.push(_project[i].id)
                };

                localStorage.setItem("PROJECT", JSON.stringify(_validId));
            };
    
            // Return the valid project
            return _response.data;

        }
        catch(error) {
            console.log("Library/Project/GetValidated(): ", error);
            return [];
        }

    },
    SetLocal: function(projectId = "") {
    
        try {
            
            // Get local project
            const _projectId = this.GetLocal();
            _projectId.push(projectId);

            // Update local project
            localStorage.setItem("PROJECT", JSON.stringify(_projectId));

        }
        catch(error) {
            console.log("Library/Project/SetLocal(): ", error);
            throw error;
        }

    },
    IsValid: function(project = {}) {
        return !(!project || typeof(project) === "undefined");
    }
};

function Auth() {
    
    // Open signup page in new window
    const _url = "/api/google/auth";
    const _window = window.open(_url, "_blank", "width=600,height=600");
    if(_window) {
        _window.focus();
    };
    
}

async function GetLocalProject() {

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
        console.error("GetLocalProject(): Unable to get validated project list:", error);
        return null;
    };
    
}
async function SetLocalProject(project = {}) {

    try {
        let _project = await getProjectList();
        if(_project == null) {
            _project = [];
        };
        _project.push(project);
        localStorage.setItem("PROJECT", JSON.stringify(_project));
    }
    catch (error) {
        console.error("SetLocalProject(): Unable to save local project:", error);
        return false;
    }

}
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

export default { Project: Project, Auth: Auth };