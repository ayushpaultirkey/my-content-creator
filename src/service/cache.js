import path from "path";
import fs from "fs/promises";
import directory from "../library/directory.js"

let CACHE = {};


/**
    * 
    * @param {*} file 
    * @returns 
*/
function CachePath(file = "") {
    const { __dirname } = directory();
    return path.join(__dirname, `../../project/.cache/${file}`);
};


/**
    * 
    * @returns 
*/
async function CacheExist() {
    try {
        await fs.access(CachePath(".reference.json"));
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
async function InitializeCache() {
    
    try {

        // Check if cache.json exists
        const _cacheExist = await CacheExist();

        // Create empty cache if not exists
        if(!_cacheExist) {
            await fs.writeFile(CachePath(".reference.json"), JSON.stringify({ image: {}, video: {}, audio: {} }));
        };

        // Read cache fil
        const _data = await fs.readFile(CachePath(".reference.json"), "utf8");
        const _json = JSON.parse(_data);

        // Store json data
        CACHE = _json;

        //
        return true;

    }
    catch(error) {
        console.log("InitializeCache():", error);
        return false;
    }

}


/**
    * 
    * @param {*} query 
    * @param {"image" | "video" | "audio"} type 
    * @param {*} data 
*/
function UpdateCache(query = "", type = "", data = []) {
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
function ReadCache() {
    return CACHE;
}


/**
    * 
    * @param {*} query 
    * @param {"image" | "video" | "audio"} type 
    * @returns {[{url, name}]}
*/
function CacheHit(query = "", type = "") {
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
async function SaveCache() {
    try {
        await fs.writeFile(CachePath(".reference.json"), JSON.stringify(CACHE));
        return true;
    }
    catch(error) {
        console.log("SaveCache():", error);
        return false;
    };
}


export { ReadCache, UpdateCache, SaveCache, InitializeCache, CacheHit, CachePath };