import "dotenv/config";
import fs from "fs";
import say from "say";
import path from "path";
import util from "util";
import googlecloud from "@google-cloud/text-to-speech";

import Project from "../frame/project.js";


async function ByLocalTTS(content = [{ text, destination }]) {

    //
    if(!content) {
        throw new Error("Invalid content");
    };
    
    //
    function _export(text, destination) {
        return new Promise((resolve, reject) => {
            say.export(text, undefined, 1, destination, (error) => {
                if(error) {
                    reject(error);
                }
                else {
                    resolve();
                };
            });
        });
    };

    //
    for(var i = 0, l = content.length; i < l; i++) {

        //
        try {
            await _export(content[i].text, content[i].destination);
            console.log(`S/Asset/ByLocalTTS(): voice-${i} created`);
        }
        catch(error) {
            console.log(`S/Asset/ByLocalTTS(): Error creating voice-${i}:`, error);
        };
        
    };

};


async function ByExternalTTS(content = [{ text, destination }]) {

    //
    if(!content) {
        throw new Error("Invalid content");
    };

    //
    const _client = new googlecloud.TextToSpeechClient();

    //
    async function _export(text, destination) {
        try {

            //
            console.log("S/Asset/Voice/ByExternalTTS(): Audio narration creation started");

            //
            const [ _response ] = await _client.synthesizeSpeech({
                input: { text: text },
                voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
                audioConfig: { audioEncoding: "LINEAR16" },
            });

            //
            const _writer = util.promisify(fs.writeFile);
            await _writer(destination, _response.audioContent, "binary");

            //
            console.log("S/Asset/Voice/ByExternalTTS(): Audio narration creation completed");

        }
        catch(error) {

            console.log("S/Asset/Voice/ByExternalTTS(): Failed to create audio", error);
            
        };
    };

    //
    try {

        //
        for(var i = 0, l = content; i < l; i++) {
            await _export(content[i].text, content[i].destination);
        };

    }
    catch(error) {
        console.log("S/Asset/Voice/ByExternalTTS(): Error while creating voice for slides", error);
    };

};

export default { ByExternalTTS, ByLocalTTS };