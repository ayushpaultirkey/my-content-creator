import path from "path";
import fs from "fs/promises";
import chalk from "chalk";
import directory from "#library/directory.js"

let CACHE = {};


/**
    * 
    * @param {*} file 
    * @returns 
*/
function Path(file = "") {
    const { __dirname } = directory();
    return path.join(__dirname, `../../project/.cache/${file}`);
};


/**
    * 
    * @returns 
*/
async function CacheExist() {
    try {
        await fs.access(Path(".reference.json"));
        return true;
    }
    catch (error) {
        return false;
    }
}


/**
    * 
    * @returns 
*/
async function Initialize() {
    
    try {

        // Check if cache.json exists
        const _cacheExist = await CacheExist();

        // Create empty cache if not exists
        if(!_cacheExist) {
            await fs.writeFile(Path(".reference.json"), JSON.stringify({ image: {}, video: {}, audio: {} }));
        };

        // Read cache fil
        const _data = await fs.readFile(Path(".reference.json"), "utf8");
        const _json = JSON.parse(_data);

        // Store json data
        CACHE = _json;

        //
        return true;

    }
    catch(error) {
        console.log(chalk.red("/S/Asset.Initialize():"), error);
        return false;
    }

}


/**
    * 
    * @param {*} query 
    * @param {"image" | "video" | "audio"} type 
    * @param {*} data 
*/
function Update(query = "", type = "", data = []) {
    if(typeof(CACHE[type][query]) === "undefined") {
        CACHE[type][query] = data;
    }
    else {
        CACHE[type][query].push( ... data);
    }
}


/**
    * 
    * @returns 
*/
function Read() {
    return CACHE;
}


/**
    * 
    * @param {*} query 
    * @param {"image" | "video" | "audio"} type 
    * @returns {[{url, name, destination}]}
*/
function Hit(query = "", type = "") {
    if(typeof(CACHE[type][query]) !== "undefined") {
        return CACHE[type][query];
    }
    else {
        return null;
    }
}


/**
    * 
    * @returns 
*/
async function Save() {
    try {
        await fs.writeFile(Path(".reference.json"), JSON.stringify(CACHE));
        return true;
    }
    catch(error) {
        console.log(chalk.red("/S/Asset.Save():"), error);
        return false;
    };
}


export default { Read, Update, Save, Initialize, Hit, Path };