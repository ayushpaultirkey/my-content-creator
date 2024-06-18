import path from "path";
import multer from "multer";
import fs from "fs/promises";

import directory from "../../library/directory.js";

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

        if(file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            callback(null, true);
        }
        else {
            callback(new Error('Only images are allowed!'), false);
        };

    }
}).array("files", 20);

export { Uploader };