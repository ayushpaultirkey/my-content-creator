import path from "path";
import multer from "multer";
import fsp from "fs/promises";
import crypto from "crypto";
import directory from "#library/directory.js";

// Get directory
const { __root } = directory();


/**
    * 
*/
export default multer({
    storage: multer.diskStorage({
        destination: async(request, file, callback) => {

            try {

                // Set upload path
                const _path = path.join(path.join(__root, `/project/.temp/`));
                await fsp.mkdir(_path, { recursive: true });
                
                //
                callback(null, _path);

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

        if(
            file.mimetype.startsWith("image/") ||
            file.mimetype.startsWith("video/") ||
            file.mimetype.startsWith("audio/") ||
            file.mimetype.startsWith("text/") ||
            file.mimetype === "application/pdf") {

            callback(null, true);

        }
        else {
            callback(new Error("Only images, video, audio, text and pdf are allowed!"), false);
        };

    }
}).array("files", 20);