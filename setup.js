
const path = require("path");
const zip = require("cross-zip");
const download = require("nodejs-file-downloader");

async function download(url, name, output) {

    const _downloader = new download.Downloader({
        url: `${url}/${name}`,
        directory: path.join(__dirname, "./library/"),
        onProgress: function (percentage) {
            console.log(name, "=> downloaded:", percentage, "%");
        }
    });

    try {
        await _downloader.download();
        zip.unzipSync(path.join(__dirname, `./library/${name}`), path.join(__dirname, output));
        console.log(name, "=> created");
    }
    catch(error) {
        console.log("Unable to download file", error);
    };

};

(async () => {

    const url = "https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v6.1";
    const output = "./library/ffmpeg/bin/";

    try {
        await download(url, "ffmpeg-6.1-win-64.zip", output);
        await download(url, "ffprobe-6.1-win-64.zip", output);
    }
    catch(ex) {
        console.error("Unable to download ffmpeg library, try downloading it manually and place it at /library/ffmpeg/bin", ex);
    };

})();