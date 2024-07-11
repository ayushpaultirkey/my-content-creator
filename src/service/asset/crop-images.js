import sharp from "sharp";
import chalk from "chalk";


export default async function CropImages({ input = [], output = [], width = 512, height = 512 }) {

    try {

        const _promise = [];

        const _crop = async(source, destination) => {
            return new Promise(async(resolve, reject) => {

                try {

                    if(!source || !destination) {
                        throw new Error("Invalid image asset to crop");
                    };

                    await sharp(source)
                    .resize({
                        width: (width * 1),
                        height: (height * 1),
                        fit: "cover"
                    })
                    .toFile(destination);

                    console.log(chalk.green("/S/Asset/CropImages():"), `Image cropped ${destination}`);
                    resolve();

                }
                catch(error) {
                    reject(error);
                };

            });
        };

        // Check if the input and output array index is
        // valid and then crop it
        for(var i = 0, l = input.length; i < l; i++) {
            if(!input[i] || !output[i]) {
                console.log(chalk.red("/S/Asset/CropImages():"), "Invalid input or output at index", i)
                continue;
            };
            _promise.push(_crop(input[i], output[i]));
        };

        await Promise.all(_promise);

        console.log(chalk.green("/S/Asset/CropImages():"), "All images cropped");

    }
    catch(error) {
        console.log(chalk.red("/S/Asset/CropImages():"), error);
        throw new Error("Unable to crop images");
    };

};