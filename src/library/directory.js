import url from "url";
import path from "path";

/**
 * 
 * @param {string} dir 
 * @returns {{ __dirname: string, __filename: string }}
*/
export default function directory(dir = import.meta.url) {

    //Get current directory
    const __filename = url.fileURLToPath(dir);
    const __dirname = path.dirname(__filename);

    return {
        __filename: __filename,
        __dirname: __dirname
    };

};