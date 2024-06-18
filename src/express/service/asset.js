import path from "path";
import multer from "multer";
import fs from "fs/promises";
import directory from "../../library/directory.js";
import mime from "mime-types";

const Uploader = multer({
    storage: multer.diskStorage({
        destination: async(request, file, callback) => {

            try {

                // Get project is from query string
                const _projectId = request.query.pid;
                const { __dirname } = directory();

                // Check if the project id is valid
                if(!_projectId) {
                    return callback(new Error("Project ID is required"));
                };
          
                // Create project path
                const _projectPath = path.resolve(__dirname, `../../public/project/${_projectId}/asset`);
                await fs.mkdir(_projectPath, { recursive: true });
                
                callback(null, _projectPath);

            }
            catch(error) {
                callback(error);
            };

        },
        filename: (request, file, callback) => {
            
            callback(null, crypto.randomUUID() + path.extname(file.originalname));

        }
    }),
    fileFilter: (request, file, callback) => {

        if(file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
            callback(null, true);
        }
        else {
            callback(new Error("Only images and video are allowed!"), false);
        };

    }
}).array("files", 20);


async function GetAssetList(projectId = "") {

    try {
        
        // Get current directory path
        const { __dirname } = directory();

        // Get project path and read the project json file
        const _path = path.join(__dirname, `../../public/project/${projectId}/asset/`);

        // Get files
        const _files = await fs.readdir(_path);
        const _fileList = [];

        for(const file of _files) {

            const _filePath = path.join(_path, file);
            const _fileStat = await fs.stat(_filePath);
      
            if(_fileStat.isFile()) {

                const _mime = mime.lookup(_filePath);
              
                // Check if the file is an image, video, or audio
                if(_mime && (_mime.startsWith('image/') || _mime.startsWith('video/') || _mime.startsWith('audio/'))) {
                    _fileList.push({
                        name: file,
                        type: _mime,
                        url: `/project/${projectId}/asset/${file}`
                    });
                };

            };
            
        };

        return _fileList;

    }
    catch(error) {

        console.error(`Error reading directory for project ${projectId}:`, error);
        throw new Error("Error reading project asset");

    };

}

export { Uploader, GetAssetList };