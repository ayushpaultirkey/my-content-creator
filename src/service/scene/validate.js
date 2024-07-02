import fs from "fs/promises";
import path from "path";

import directory from "../../library/directory.js";
import Project from "../project.js";

// Get directory path
const { __root } = directory();

export default async function Validate(projectId, asset) {
    
    //
    const _asset = [];
    for(const x of asset) {
        try {
            const _assetPath = path.join(Project.Path(projectId), "/asset/", x.name);
            await fs.access(_assetPath);
            _asset.push({
                name: _assetPath,
                effect: (typeof(x.effect) === "undefined" || x.effect.length < 2) ? "fadeIn" : x.effect
            });
        }
        catch(error) {
            console.log(`Service/Scene/Validate(): Cannot find ${x} asset file for ${projectId}`, error);
        };
    };

    return _asset;

};