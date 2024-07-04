import fs from "fs/promises";
import path from "path";

import Report from "./analytics/report.js";
import Config from "./analytics/@config.js";
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
            return JSON.parse(_data);
        }
        else {
            return [];
        };

    }
    catch(error) {
        console.log("/Service/Google/Youtube/Analytics/Read():", error);
        throw new Error("Unable to read chat session");
    }
};
async function Save(id = "", data = {}) {
    try {
        await fs.writeFile(Path(id), JSON.stringify(data));
        console.log("/Service/Google/Youtube/Analytics/Save(): Chat session saved");
    }
    catch(error) {
        console.log("/Service/Google/Youtube/Analytics/Save():", error);
        throw new Error("Unable to save chat session");
    }
};


export default { Report, Config, Local: { Read, Path, Save, Exist } };