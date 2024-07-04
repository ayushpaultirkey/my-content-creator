
import { join } from "path";
import { unzipSync } from "cross-zip";
import { Downloader } from "nodejs-file-downloader";
import url from "url";
import path from "path";
import os from "os";

/**
    * 
    * @param {string} dir 
    * @returns {{ __dirname: string, __filename: string }}
*/
function directory(dir = import.meta.url) {

    //Get current directory
    const __filename = url.fileURLToPath(dir);
    const __dirname = path.dirname(__filename);

    return {
        __filename: __filename,
        __dirname: __dirname
    };

};

/**
    * Downloads file from url to output path
    * @param {string} url 
    * @param {string} name 
    * @param {string} output 
*/
async function download(url, output, name) {

    // Get directory
    const { __dirname } = directory();

    // Create new downloader
    const _downloader = new Downloader({
        url: `${url}/${name}`,
        directory: join(__dirname, output),
        onProgress: function(percentage) {

            const _bars = Math.floor(percentage / 10);
            const _progress = `[${'='.repeat(_bars)}${' '.repeat(10 - _bars)}]`;

            process.stdout.write(`${name}: ${_progress} ${percentage}%\r`);

        },
        onError: function(error) {
            console.log(`Unable to download ${name} from ${url}`);
            console.log(error);
        }
    });

    // Start download
    try {
        console.log(`${name} download started.`);
        await _downloader.download();
        unzipSync(join(__dirname, output, name), join(__dirname, output));
        console.log(`${name} downloaded & extraced at ${output}${name}`);
    }
    catch(error) {
        console.log("Unable to download file", error);
    };

};

(async () => {

    const platform = os.platform();

    if(platform === "win32") {

        const url = "https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v6.1";
        const output = "../library/";
    
        try {
            await download(url, output, "ffmpeg-6.1-win-64.zip");
            await download(url, output, "ffprobe-6.1-win-64.zip");
            console.log("All files downloaded");
            console.log("use `npm start` command to start application");
        }
        catch(ex) {
            console.log("Unable to download ffmpeg library, try downloading it manually and place it at /library/", ex);
        };

    }
    else if(platform === "linux") {
        console.log("Use: sudo apt install ffmpeg")
    }


})();