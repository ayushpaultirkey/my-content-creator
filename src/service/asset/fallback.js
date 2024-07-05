import "dotenv/config";
import path from "path";

import directory from "#library/directory.js";
const { __root } = directory();

/**
 * 
 * @param {"IMAGE" | "VIDEO" | "AUDIO"} type 
 * @returns 
 */
export default function Fallback(type = "") {

    let _path = `/project/.cache/`;
    switch(type) {
        case "IMAGE":
            _path = path.join(__root, _path, "/fallback-i.png");
            break;
        case "VIDEO":
            _path = path.join(__root, _path, "/fallback-v.mp4");
            break;
        case "AUDIO":
            _path = path.join(__root, _path, "/fallback-a.wav");
            break;
    };

    return _path;

};