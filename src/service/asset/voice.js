import "dotenv/config";
import fs from "fs";
import say from "say";
import path from "path";
import util from "util";
import googlecloud from "@google-cloud/text-to-speech";

import Project from "./../project.js";


/**
    * Create a TTS using local system
    * @param {*} projectId 
*/
async function ByLocalTTS(projectId = "", slide = []) {

    // Validate projectId and slide input
    if(!projectId || !slide || slide.length === 0) {
        throw new Error("Invalid projectId or slide data");
    };
    
    // Get project path and update the project json file
    const _path = Project.Path(projectId);

    // Function to export spoken audio to a WAV file
    function _export(content, filePath) {
        return new Promise((resolve, reject) => {
            say.export(content, undefined, 1, filePath, (error) => {
                if(error) {
                    reject(error);
                }
                else {
                    resolve();
                };
            });
        });
    };

    // Create audio files for the slides
    for(var i = 0, l = slide.length; i < l; i++) {

        // Export spoken audio to a WAV file
        try {
            await _export(slide[i].content, path.join(_path, `/asset/${slide[i].id}.wav`));
            console.log(`Service/Asset/ByLocalTTS(): ${slide[i].id} voice created`);
        }
        catch(error) {
            console.log(`Service/Asset/ByLocalTTS(): Error creating voice for slide ${slide[i].id}:`, error);
        };
        
    };

};


/**
    * Create TTS using google cloud TTS service
    * @param {*} projectId 
*/
async function ByExternalTTS(projectId = "", slide = []) {

    // Validate projectId and slide input
    if(!projectId || !slide || slide.length === 0) {
        throw new Error("Invalid projectId or slide data");
    };

    // Creates a google cloud client
    const _client = new googlecloud.TextToSpeechClient();

    // Get project path and update the project json file
    const _path = Project.Path(projectId);

    // Function to export spoken audio to a WAV file
    async function _export(content, filePath, id) {
        try {

            // Log
            console.log(`Service/Asset/ByExternalTTS(): Audio narration creation started for ${id}`);

            // Create tts response
            const [ _response ] = await _client.synthesizeSpeech({
                input: { text: content },
                voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
                audioConfig: { audioEncoding: "LINEAR16" },
            });

            // Write the binary audio content to a local file
            const _writer = util.promisify(fs.writeFile);
            await _writer(filePath, _response.audioContent, "binary");

            // Log
            console.log(`Service/Asset/ByExternalTTS(): Audio narration creation completed for ${id}`);

        }
        catch(error) {

            // Log
            console.log(`Service/Asset/ByExternalTTS(): Failed to create audio for ${id}`, error);
            
        };
    };

    // Try and create TTS
    try {

        // Create audio files for the slides
        for(var i = 0, l = slide.length; i < l; i++) {
            await _export(slide[i].content, path.join(_path, `/asset/${slide[i].id}.wav`), slide[i].id);
        };

    }
    catch(error) {
        console.log("Service/Asset/VoiceByExternalTTS(): Error while creating voice for slides", error);
    };

};

export default { ByExternalTTS, ByLocalTTS };