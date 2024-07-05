import chalk from "chalk";
import Read from "#service/frame/project/read.js";
import Youtube from "#service/google/youtube.js";
import Project from "#service/frame/project.js";

export default async function Upload({ projectId = "", title, category, description, callback }) {

    try {

        //
        if(!projectId) {
            throw new Error("No project or file id is not defined");
        };

        //
        let _title = title;
        let _description = description;

        //
        if(!title || !description) {
            const _project = await Read(projectId);
            _title = _project.property.title;
            _description = _project.property.description;
        };

        //
        const _filePath = await Project.Export.GetFile(projectId);

        //
        await Youtube.Upload({
            filePath: _filePath.path,
            title: _title,
            category: category,
            description: _description,
            callback: callback
        })

        callback("Drive: Upload finished");
        console.log(`${chalk.green("S/Frame/Youtube/UploadFile():")} File uploaded`);

    }
    catch(error) {
        console.log(`${chalk.red("S/Frame/Youtube/UploadFile():")} ${error}`);
        throw error;
    };

};