import ServerEvent from "./sse";


function DUploadFile(projectId = "", { onOpen, onMessage, onFinish, onError }) {

    try {

        // Check if the project id is valid
        if(!projectId) {
            throw new Error("Invalid project");
        };

        // Register new server send event
        const _source = new ServerEvent(`/api/google/drive/upload?pid=${projectId}`, { onOpen, onMessage, onFinish, onError });
        return _source;

    }
    catch(error) {
        throw error;
    };

};


function YTUploadFile(projectId = "", title, description, category, { onOpen, onMessage, onFinish, onError }) {

    try {

        // Check if the project id is valid
        if(!projectId || !title || !description || !category) {
            throw new Error("Invalid project");
        };
    
        // Register new server send event
        const _source = new ServerEvent(`/api/project/export/youtube?pid=${projectId}&t=${title}&d=${description}&c=${category}`, { onOpen, onMessage, onFinish, onError });
        
        //
        return _source;

    }
    catch(error) {
        throw error;
    };

};


export default {
    Drive: {
        UploadFile: DUploadFile
    },
    Youtube: {
        UploadFile: YTUploadFile
    }
};