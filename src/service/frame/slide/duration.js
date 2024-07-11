import chalk from "chalk";
import * as mm from "music-metadata";


async function ByAudio(audioPath = "") {
    try {

        // Get the duration of the audio file
        const _metadata = await mm.parseFile(audioPath);
        const _duration = Math.ceil(_metadata.format.duration);

        console.log(chalk.green("/S/Slide/Duration/ByAudio():"), "Time calculated using audio:", _duration);

        return _duration;

    }
    catch(error) {
        console.log(chalk.red("/S/Slide/Duration/ByAudio():"), error);
        throw error;
    };

};

function ByContent(content = "", wpm = 140) {

    // Split the sentence into words and try to
    // get the total time to read the text
    const _words = content.trim().split(/\s+/);
    const _totalWords = _words.length;
    const _duration = Math.ceil((_totalWords / wpm) * 60);
  
    console.log(chalk.green("/s/Slide/Duration/ByContent():"), "Time calculated using content:", _duration);

    return _duration;

};



export default async function Duration({ filePath = "", content = "" }) {

    let _duration = 10;

    // If the audio file is not found then the content will be
    // used to calculate the audio length
    try {
        _duration = await ByAudio(filePath);
    }
    catch(error) {

        console.log(chalk.yellow("/S/Slide/Duration():"), "Audio file not found, using content for time");

        _duration = ByContent(content);

    };

    return (_duration < 4) ? 4 : _duration;

};