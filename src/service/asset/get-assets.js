import "dotenv/config";
import path from "path";
import chalk from "chalk";
import fs from "fs/promises";
import mime from "mime-types";


export default async function GetAssets(searchIn) {

    try {

        // Get files
        const _file = await fs.readdir(searchIn);
        const _fileList = [];

        // Iterate for each file
        for(const file of _file) {

            // Get file stat and path
            const _filePath = path.join(searchIn, file);
            const _fileStat = await fs.stat(_filePath);
      
            // Check if its file
            if(_fileStat.isFile()) {

                // Check if the file isnt narration file
                if(file.match(/slide[0-9]+\.wav/g)) {
                    continue;
                };

                // Get its mime type
                const _mime = mime.lookup(_filePath);
              
                // Check if the file is an image, video, or audio
                if(_mime && (_mime.startsWith("image/") || _mime.startsWith("video/") || _mime.startsWith("audio/"))) {
                    _fileList.push({
                        name: file,
                        type: _mime
                    });
                };

            };
            
        };

        // Return the files list
        return _fileList;

    }
    catch(error) {
        console.log(chalk.red("S/Asset.GetAssets():"), error);
        throw new Error("Unable to get assets");
    };

}