export default {
    /**
        * Get the local project's id
        * @returns {[string]}
    */
    GetLocalProject: function() {

        try {

            const _project = localStorage.getItem("PROJECT");
            if(!_project) {
                throw new Error("No project")
            };
            
            return JSON.parse(_project);

        }
        catch(error) {
            console.warn(error);
            return [];
        };

    },
    /**
        * Get the validated projects by their id
        * @returns
    */
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
    
            // Check if the local project can be updated
            if(update) {

                // Get Response data and add to PROJECT
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
            console.log(error);
            return [];
        };

    },
    /**
        * Add the project's id to the local storage
    */
    SetLocalProject: function(projectId = "") {
    
        try {
            
            // Get local project
            const _projectId = this.GetLocalProject();
            _projectId.push(projectId);

            // Update local project
            localStorage.setItem("PROJECT", JSON.stringify(_projectId));

        }
        catch(error) {
            console.error(error);
            throw error;
        };

    },
};