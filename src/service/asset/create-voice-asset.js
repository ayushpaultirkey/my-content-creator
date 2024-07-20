import "dotenv/config";
import os from "os";
import fs from "fs";
import say from "say";
import path from "path";
import util from "util";
import chalk from "chalk";
import crypto from "crypto";
import ffmpeg from "fluent-ffmpeg";
import gcTTS from "@google-cloud/text-to-speech";
import gcTranslate from "@google-cloud/translate";
import directory from "#library/directory.js";

const { __root } = directory();

async function ConvertWavToMp3(input, output) {

    return new Promise((resolve, reject) => {
        ffmpeg(input)
        .toFormat("mp3")
        .on("end", () => {
            console.log(chalk.green("/S/Asset/CreateVoiceAsset/ConvertWavToMp3():"), input, "=>", output);
            resolve();
        })
        .on("error", (error) => {
            console.log(chalk.red("/S/Asset/CreateVoiceAsset/ConvertWavToMp3():"), error);
            reject(error);
        })
        .save(output);
    });

};


async function DetectLanguage(text) {

    try {
        
        const _translate = new gcTranslate.v2.Translate();
        const [ detection ] = await _translate.detect(text);

        // Log
        console.log(chalk.green("/S/Asset/CreateVoiceAsset/DetectLanguage():"), "Language detected:", detection.language);

        return detection.language;

    }
    catch(error) {
        console.log(chalk.red("/S/Asset/CreateVoiceAsset/DetectLanguage():"), error);
    };

};

async function ByLocalTTS(content = [{ text, destination }]) {

    // Check if the content is valid
    if(!content) {
        throw new Error("Invalid content");
    };
    
    function _export(text, destination) {
        return new Promise((resolve, reject) => {

            const _tempName = `${crypto.randomUUID()}.wav`;
            const _tempPath = path.join(__root, "/project/.temp/", _tempName);

            say.export(text, undefined, 1, _tempPath, async (error) => {
                if(error) {
                    reject(error);
                }
                else {
                    resolve({ name: _tempName, directory: _tempPath });
                };
            });

        });
    };

    // Create voice by local TSS
    for(var i = 0, l = content.length; i < l; i++) {

        try {

            const { directory } = await _export(content[i].text, content[i].destination);
            await ConvertWavToMp3(directory, content[i].destination);

            console.log(chalk.green(`/S/Asset/CreateVoiceAsset/ByLocalTTS():`), `${content[i].destination} created`);

        }
        catch(error) {
            console.log(chalk.red(`/S/Asset/CreateVoiceAsset/ByLocalTTS():`), `Error creating voice ${content[i].destination}:`, error);
        };
        
    };

};


async function ByExternalTTS(content = [{ text, destination }]) {

    // Check if the content is valid
    if(!content) {
        throw new Error("Invalid content");
    };

    // Create new client for tts
    const _client = new gcTTS.TextToSpeechClient();

    async function _export(text, destination) {
        try {

            // Log
            console.log(chalk.green("/S/Asset/CreateVoiceAsset/ByExternalTTS():"), "Audio narration creation started");

            // Get language and generate voice for it
            // and save it
            const _language = await DetectLanguage(text);

            const [ _response ] = await _client.synthesizeSpeech({
                input: { text: text },
                voice: { languageCode: _language, ssmlGender: "NEUTRAL" },
                audioConfig: { audioEncoding: "MP3" },
            });

            const _writer = util.promisify(fs.writeFile);
            await _writer(destination, _response.audioContent, "binary");

            // Log
            console.log(chalk.green("/S/Asset/CreateVoiceAsset/ByExternalTTS():"), "Audio narration creation completed");

        }
        catch(error) {

            console.log(chalk.red("/S/Asset/CreateVoiceAsset/ByExternalTTS():"), "Failed to create audio", error);
            
        };
    };

    // Itrerate of each content to
    // create new file
    // Create voice by local TSS
    for(var i = 0, l = content.length; i < l; i++) {

        try {
            await _export(content[i].text, content[i].destination);
            console.log(chalk.green(`/S/Asset/CreateVoiceAsset/ByExternalTTS():`), `${content[i].destination} created`);
        }
        catch(error) {
            console.log(chalk.red(`/S/Asset/CreateVoiceAsset/ByExternalTTS():`), `Error creating voice ${content[i].destination}:`, error);
        };
        
    };

};


export default async function CreateVoiceAsset({ content, useLocalTTS = true, callback }) {

    callback("Asset: Creating voice files");

    try {

        const _platform = os.platform();

        // Use external tts in other operating systems
        if(useLocalTTS && _platform === "win32") {
            await ByLocalTTS(content);
        }
        else {
            await ByExternalTTS(content);
        };

    }
    catch(error) {
        console.log(chalk.red("/S/Asset/CreateVoiceAsset():"), error);
        throw new Error("Unable to create voice asset");
    };

};