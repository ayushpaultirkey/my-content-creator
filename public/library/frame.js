export default {
    GetLocalProject: function() {

        try {

            const _project = localStorage.getItem("PROJECT");
            if(!_project) {
                throw new Error("L/F/GetLocalProject(): no project")
            };
            
            return JSON.parse(_project);

        }
        catch(error) {
            console.warn("L/F/GetLocalProject():", error);
            return [];
        }

    },
    GetValidProject: async function(update = true) {

        try {

            // Get local project
            const _projectId = this.GetLocalProject();

            // Validate each project by their id
            const _response = await fetch(`/api/frame/project/validate?pid=${JSON.stringify(_projectId)}`);
            const { success, data } = await _response.json();
    
            // Check if success
            if(!success || !_response.ok) {
                return [];
            };
    
            // Update local project
            if(update) {

                // Get Response dat
                const _validId = [];
                const _project = data;
                for(var i = 0; i < _project.length; i++) {
                    _validId.push(_project[i].id)
                };

                localStorage.setItem("PROJECT", JSON.stringify(_validId));

            };
    
            // Return the valid project
            return data;

        }
        catch(error) {
            console.log("L/F/GetValidated(): ", error);
            return [];
        }

    },
    SetLocalProject: function(projectId = "") {
    
        try {
            
            // Get local project
            const _projectId = this.GetLocalProject();
            _projectId.push(projectId);

            // Update local project
            localStorage.setItem("PROJECT", JSON.stringify(_projectId));

        }
        catch(error) {
            console.error("L/F/SetLocalProject():", error);
            throw error;
        };

    },
};