import path from "path";
import sharp from "sharp";

import Project from "../project.js";


/**
    * 
    * @param {*} images 
    * @param {*} projectId 
    * @param {*} project 
*/
export default async function CropExternalImage(images = [], projectId, project = {}) {

    try {

        let _slide = project.property.slides;
        let _promise = [];

        // Crop image function
        const _crop = async(image, index) => {
            return new Promise(async(resolve, reject) => {

                if(typeof(_slide[index]) !== "undefined" && _slide[index].image.length !== 0) {

                    const inputPath = path.join(CachePath(), image.name);
                    const outputPath = path.join(Project.Path(projectId), `/asset/${_slide[index].image[0].name}`);
        
                    await sharp(inputPath)
                    .resize({
                        width: (project.config.width * 1),
                        height: (project.config.height * 1),
                        fit: "cover"
                    })
                    .toFile(outputPath)
                    .then(resolve)
                    .catch(reject);

                    console.log(`Service/Asset.CropImage(): Image cropped ${outputPath}`);

                };

            });
        };

        // All images and crop it
        for(var i = 0, l = images.length; i < l; i++) {
            _promise.push(_crop(images[i], i));
        };

        await Promise.all(_promise);

        console.log("Service/Asset.CropImage(): All images cropped");

    }
    catch(error) {
        console.log("Service/Asset.CropImage(): Error cropping images", error);
        throw error;
    };

};