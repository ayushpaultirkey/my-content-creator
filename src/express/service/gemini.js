import "dotenv/config";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";


/** @type {import("@google/generative-ai").GoogleGenerativeAI} */
let GENERATIVE = null;

/** @type {import("@google/generative-ai").GenerativeModel} */
let MODEL = null;


function GenerativeInit() {

    const _instruction =
    `You have to assist the user on creating a content for a video. You should only respond in json data and nothing else is accepted, the json format is explained below.
    {
    "response": string,
    "title": string,
    "description": string,
    "totalTime": int,
    "backgroundImage": [string],
    "slides": {
    "id": string,
    "content": string,
    "totalTime": int,
    "showAt": int,
    "hideAt": int,
    "image": [string]
    }
    }
    The explanation for the json data format:
    "response": this the response for the thing you have been asked, you can write anything here in response for the user.
    "title": is the title for the video, keep it precise and accurate.
    "description": the detailed description for the video, use seo to make the description stand out by using emojis, hashtag or other things and easy to understand.
    "totalTime": the total time of the video based on the time of the slides.
    "backgroundImage": in this there will be background images for the video, you cannot set the value for this.
    "slides": this is a array that contain multiple slides of the video.
    "slides"."id": the slide id should be unique and cannot be changed once created, like "slide1", "slide2"
    "slides"."content": the content for the slide, don't use any text formatting and keep it precise if the video duration is not long.
    "slides"."totalTime": the total time for the slide, adjust it according to the slide's content, so user can read it.
    "slides"."showAt": the time when the slide will be visible.
    "slides"."hideAt": the time when the slide will hide, and next slide will show.
    "slides"."image": the slide's image that will be displayed, you cannot set the value for this.`;

    GENERATIVE = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_API);
    MODEL = GENERATIVE.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: {
            role: "system",
            parts: [{ text: _instruction }]
        }
    });

};

/**
    * 
    * @param {string} prompt 
    * @param {[]} context 
    * @returns {{ context: [], response: {} }}
*/
async function GenerativeRun(prompt = "", context = []) {

    let _context = context;
    let _message = [];
    let _answer = "";
    
    try {
        
        // Create a message history for the model
        for(const [input, response] of _context) {
            _message.push({ role: "user", parts: [{ "text": input }] });
            _message.push({ role: "model", parts: [{ "text": response }] });
        };
    
        // Set the model message history
        let _chat = MODEL.startChat({
            history: _message
        });
    
        // Send message to model and get response
        let _result = await _chat.sendMessage(prompt);
        let _response = _result.response.text();
    
        // Create new context
        _context.push([prompt, _response]);

        // Get the json from the response
        const _regex = /```json(.*)```/gs;
        const _match = _regex.exec(_response);
        if(_match) {
            _answer = JSON.parse(_match[1].trim());
        }
        else {
            throw new Error("Invalid AI response");
        };

        //
        //let _jsonString = _response.replace(/^```json\s*|\s*```/g, '').trim();
        //let _jsonObject = JSON.parse(_jsonString);
        //_answer = _jsonObject;
    
    }
    catch(error) {
        console.log("GenerativeRun():", error);
        throw error;
    };

    return { context: _context, response: _answer };

}


export { GenerativeRun, GenerativeInit }