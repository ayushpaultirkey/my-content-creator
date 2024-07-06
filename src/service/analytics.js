import fs from "fs/promises";
import path from "path";

import Report from "./google/youtube/analytics/report.js";
import Config from "./google/youtube/analytics/@config.js";
import directory from "#library/directory.js";
import chalk from "chalk";

const { __root } = directory();

function Path(id) {
    return path.join(__root, `/project/.temp/${id}.json`);
};

async function Exist(id = "") {
    try {
        await fs.access(Path(id));
        return true;
    }
    catch(error) {
        return false;
    }
};

async function Read(id = "") {
    try {

        if(await Exist(id)) {

            const _data = await fs.readFile(Path(id));
            const _parsed = JSON.parse(_data);
            
            console.log(chalk.green("/S/Analytics/Read():"), "Analytic file found");

            return _parsed;
        }
        else {
            return [];
        };

    }
    catch(error) {
        console.log(chalk.red("/S/Analytics/Read():"), error);
        throw new Error("Unable to read chat session");
    }
};

async function Save(id = "", data = {}) {
    try {
        await fs.writeFile(Path(id), JSON.stringify(data));
        console.log(chalk.green("/S/Analytics/Save():"), "Chat session saved");
    }
    catch(error) {
        console.log(chalk.red("/S/Analytics/Save():"), error);
        throw new Error("Unable to save chat session");
    }
};


export default { Read, Path, Save, Exist, Config };