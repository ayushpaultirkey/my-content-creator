import path from "path";
import fs from "fs/promises";
import directory from "./../../library/directory.js"

let CACHE = {};

/**
    * 
    * @param {*} file 
    * @returns 
*/
function CachePath(file = "") {
    const { __dirname } = directory();
    return path.join(__dirname, `../../public/cache/${file}`);
}


/**
    * 
    * @returns 
*/
async function InitializeCache() {
    
    try {

        const _data = await fs.readFile(CachePath("cache.json"), "utf8");
        const _json = JSON.parse(_data);

        CACHE = _json;

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
    * @param {*} data 
*/
function UpdateCache(query = "", data = []) {
    CACHE[query] = data;
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
    * @returns {[{url, name}]}
*/
function CacheHit(query = "") {
    if(typeof(CACHE[query]) !== "undefined") {
        return CACHE[query];
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
        await fs.writeFile(CachePath("cache.json"), JSON.stringify(CACHE));
        return true;
    }
    catch(error) {
        console.log("SaveCache():", error);
        return false;
    };
}


export { ReadCache, UpdateCache, SaveCache, InitializeCache, CacheHit, CachePath };