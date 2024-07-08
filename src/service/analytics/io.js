import fs from "fs/promises";
import path from "path";
import chalk from "chalk";

import directory from "#library/directory.js";

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
            
            console.log(chalk.green("/S/Analytics/io/Read():"), "Analytic file found");

            return _parsed;
            
        }
        else {
            return {};
        };
    }
    catch(error) {
        console.log(chalk.red("/S/Analytics/io/Read():"), error);
        throw new Error("Unable to read analytics session");
    }
};

async function Save(id = "", data = {}) {
    try {
        await fs.writeFile(Path(id), JSON.stringify(data));
        console.log(chalk.green("/S/Analytics/io/Save():"), "Analytics data saved");
    }
    catch(error) {
        console.log(chalk.red("/S/Analytics/io/Save():"), error);
        throw new Error("Unable to save analytics session");
    }
};


export default { Path, Exist, Read, Save }