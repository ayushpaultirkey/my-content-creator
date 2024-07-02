import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";


/** @type {import("@google/generative-ai").GenerativeModel} */
let MODEL = null;

/** @type {import("@google/generative-ai").GoogleGenerativeAI} */
let GENERATIVE = null;

/** @type {import("@google/generative-ai/server").GoogleAIFileManager} */
let FILEMANAGER = null;

/**
    * 
*/
function Initialize() {

    // TODO
    // Make the slide's content array
    const _instruction =
`You have to assist the user on creating a content for a video. You should only respond in json data and nothing else is accepted, the json format is explained below.
{
"response": string,
"title": string,
"description": string,
"keyword": string,
"slides": [{
"id": string,
"content": string,
"image": [{ name: string, effect: string }],
"video": [{ name: string, effect: string }]
}]
}
The explanation for the json data format:
"response": this the response for the thing you have been asked, you can write anything here in response for the user so the user can interact with you in a more natural way.
"title": is the title for the video, keep it precise and accurate.
"description": the detailed description for the video, use seo to make the description stand out by using emojis, hashtag or other things and easy to understand.
"keyword": a single word in lower case to describe the video and it can be used to search related contents.
"slides": this is a array that contain multiple slides of the video.
"slides"."id": the slide id should be unique and cannot be changed once created, like "slide1", "slide2"
"slides"."content": the content for the slide, don't use any text formatting and keep it precise if the video duration is not long.
"slides"."image": the array of slide's image that will be displayed, you cannot set the value for this.
"slides"."image"."name": this will be the name for the image file, you cannot set the value for this. The default value will be [{ name: <RandomID>.jpg, effect: "" }] where "RandomID" is any random alpha digits and make it unique.
"slides"."image"."effect": this will contain the transition effect for the image. If its not provided then leave it blank.
"slides"."video": the array of slide's video that will be displayed, you cannot set the value for this. If its not provided then do not add the entry to array, remember dont add video on your own.
"slides"."video"."name": this will be the name for the video file, you cannot set the value for this.
"slides"."video"."effect": this will contain the transition effect for the video. If its not provided then leave it blank.

Make sure to always create a video content on first try, so user can modify things later on, remember to not create an empty content. And dont add video in slides on you own.`;

    GENERATIVE = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API);
    FILEMANAGER = new GoogleAIFileManager(process.env.GOOGLE_GEMINI_API);

    MODEL = GENERATIVE.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: {
            role: "system",
            parts: [{ text: _instruction }]
        },
        generationConfig: {
            responseMimeType: "application/json"
        }
    });

};


/**
    * 
    * @param {{ fieldname, originalname, encoding, mimetype, destination, filename, path, size }} file 
    * @param {*} history 
    * @returns 
*/
async function PromptFile(file = {}, history = [], validate = true) {

    // Log
    console.log(`Service/Gemini.PromptFile(): Multimodel prompt started`);

    // Validate the history before prompting, this can check for valid asset urls
    if(validate) {
        for(var i = 0, len = history.length; i < len; i++) {
    
            try {
                if(history[i].role == "user" && typeof(history[i].parts[0].fileData) !== "undefined") {
                    const _uri = history[i].parts[0].fileData.fileUri.split("/files/")[1];
                    await FILEMANAGER.getFile(_uri);
                };
            }
            catch(error) {
                delete history[i].parts[0].fileData;
                history[i].parts[0].text = "Cannot view asset since it was expired after 48 hours.";
                console.log(`Service/Gemini.PromptFile(): File not exists, it will be removed from history`);
            };
    
        };
    };

    // Try and upload asset
    try {

        // Upload file to file namager
        const _upload = await FILEMANAGER.uploadFile(file.path, {
            mimeType: file.mimetype,
            displayName: file.filename,
        });
    
        // Get uploaded file
        const _file = _upload.file;
    
        // Add file to history
        history.push({
            role: "user",
            parts: [{
                fileData: {
                    mimeType: _file.mimeType,
                    fileUri: _file.uri,
                }
            }]
        });
    
        // Log
        console.log(`Service/Gemini.PromptFile(): Uploaded file ${_file.name}`);

        // Return the file with updated history
        return { file: _file, history: history };

    }
    catch(error) {

        console.log("Service/Gemini.PromptFile(): ", error);
        throw error;

    };

};


/**
    * 
    * @param {*} prompt 
    * @param {*} history 
    * @returns 
*/
async function Prompt(prompt = "", history = []) {

    try {

        // Log
        console.log("Service/Gemini.Prompt(): Prompt started");

        // Set the model message history
        let _chat = MODEL.startChat({
            history: history
        });

        // Send message to model and get response
        let _result = await _chat.sendMessage(prompt);
        let _raw = _result.response.text();
        let _response = JSON.parse(_raw);

        // Log
        console.log("Service/Gemini.Prompt(): Prompt ended");

        // Return data
        return { response: _response, raw: _raw, history: history };

    }
    catch(error) {
        console.log("Service/Gemini.Prompt():", error);
        throw error;
    };

};




export default { Prompt, PromptFile, Initialize }