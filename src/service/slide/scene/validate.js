import fs from "fs/promises";
import path from "path";
import mime from "mime";

import directory from "../../../library/directory.js";
import Project from "../../frame/project.js";

// Get directory path
const { __root } = directory();

async function UseFallback(assetPath) {

    try {

        // Get file type and create fallback asset pth
        let _fallbackPath = path.join(__root, "/project/.cache/");

        let _mimetype = mime.getType(assetPath);
        if(_mimetype.includes("image")) {
            _fallbackPath = path.join(_fallbackPath, "/fallback-i.png");
        }
        else if(_mimetype.includes("video")) {
            _fallbackPath = path.join(_fallbackPath, "/fallback-v.mp4");
        }
        else if(_mimetype.includes("audio")) {
            _fallbackPath = path.join(_fallbackPath, "/fallback-a.wav");
        }
        else {
            throw new Error("Invalid fallback asset type")
        };

        // Copy fallback asset to project folder
        await fs.copyFile(_fallbackPath, assetPath);

        // Log
        console.log("Service/Scene/Validate/UseFallback(): Using fallback asset in project");

        //
        return true;

    }
    catch(error) {
        console.log("Service/Scene/Validate/UseFallback(): Unable to use fallback asset", error);
    };

};


export default async function Validate(projectPath, asset) {
    
    //
    const _asset = [];
    for(const x of asset) {

        const _assetPath = path.join(projectPath, "/asset/", x.name);

        try {

            await fs.access(_assetPath);

            _asset.push({
                name: _assetPath,
                effect: (typeof(x.effect) === "undefined" || x.effect.length < 2) ? "fadeIn" : x.effect
            });

        }
        catch(error) {

            console.log(`Service/Scene/Validate(): Cannot find ${x} asset file`, error);

            // Try to use fallback asset
            if(await UseFallback(_assetPath)) {
                _asset.push({
                    name: _assetPath,
                    effect: (typeof(x.effect) === "undefined" || x.effect.length < 2) ? "fadeIn" : x.effect
                });
            };

        };
    };

    return _asset;

};