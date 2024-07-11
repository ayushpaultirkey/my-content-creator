import fs from "fs/promises";
import path from "path";
import mime from "mime";
import chalk from "chalk";

import Fallback from "#service/asset/fallback.js";


async function UseFallback(assetPath) {

    try {


        let _fallbackPath = "";
        let _mimetype = mime.getType(assetPath);

        if(_mimetype.includes("image")) {
            _fallbackPath = Fallback("IMAGE");
        }
        else if(_mimetype.includes("video")) {
            _fallbackPath = Fallback("VIDEO");
        }
        else if(_mimetype.includes("audio")) {
            _fallbackPath = Fallback("AUDIO");
        }
        else {
            throw new Error("Invalid fallback asset type")
        };

        await fs.copyFile(_fallbackPath, assetPath);

        console.log(chalk.yellow("/S/Frame/Slide/Scene/Validate.UseFallback():"), "Using fallback asset in project");

        return true;

    }
    catch(error) {
        console.log(chalk.red("/S/Frame/Slide/Scene/Validate.UseFallback():"), "Unable to use fallback asset", error);
    };

};


export default async function Validate(projectPath, asset) {
    
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

            console.log(chalk.red("/S/Frame/Slide/Scene/Validate():"), `Cannot find ${x} asset file`, error);

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