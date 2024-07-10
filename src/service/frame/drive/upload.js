import chalk from "chalk";
import Drive from "#service/google/drive.js";
import Project from "#service/frame/project.js";

export default async function UploadFile({ projectId = "", request, callback }) {

    try {

        //
        if(!projectId) {
            throw new Error("No project or file id is not defined");
        };

        //
        const _filePath = await Project.Export.GetFile(projectId);

        //
        await Drive.UploadFile({
            filePath: _filePath.path,
            request: request,
            callback: callback
        });

        callback("Drive: Upload finished");
        console.log(chalk.green("/S/Frame/Drive/UploadFile():"), "File uploaded");

    }
    catch(error) {
        console.log(chalk.green("/S/Frame/Drive/UploadFile():"), error);
        throw new Error("Unable to upload file");
    };

};