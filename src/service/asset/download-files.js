import fs from "fs";
import axios from "axios";
import chalk from "chalk";


export default async function DownloadFiles(targets = [{ url, name, destination }]) {

    try {
        
        const _validated = [];
        const _promise = [];

        const _download = async(url, filePath) => {

            const _response = await axios({ url: url, responseType: "stream" });
            return new Promise((resolve, reject) => {

                const _writer = fs.createWriteStream(filePath);
                _response.data.pipe(_writer);
            
                _writer.on("finish", () => {

                    _validated.push(filePath);
                    resolve();

                });
                _writer.on("error", reject);

            });
            
        };
    
        // Iterate for all link to download
        for(var i = 0, len = targets.length; i < len; i++) {
    
            _promise.push(_download(targets[i].url, targets[i].destination));
    
        };
    
        // Wait for all targets to download
        await Promise.all(_promise);
        console.log(chalk.green("/S/Asset/DownloadFiles():"), "All files downloaded");

        // Return validated downloaded file
        return _validated;

    }
    catch(error) {
        console.log(chalk.red("/S/Asset/DownloadFiles():"), error);
        throw new Error("Unable to download files");
    };

};