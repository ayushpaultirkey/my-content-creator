import "dotenv/config";
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
    "backgroundImage": [{ name: string, effect: string }],
    "backgroundVideo": [{ name: string, effect: string }],
    "slides": [{
    "id": string,
    "content": string,
    "totalTime": int,
    "showAt": int,
    "hideAt": int,
    "image": [{ name: string, effect: string }],
    "video": [{ name: string, effect: string }]
    }]
    }
    The explanation for the json data format:
    "response": this the response for the thing you have been asked, you can write anything here in response for the user so the user can interact with you in a more natural way.
    "title": is the title for the video, keep it precise and accurate.
    "description": the detailed description for the video, use seo to make the description stand out by using emojis, hashtag or other things and easy to understand.
    "totalTime": the total time of the video based on the time of the slides.
    "backgroundImage": in this there will be array of background images for the video, you cannot set the value for this.
    "backgroundImage."name": this will be the name for the background image file, you cannot set the value for this. If its not provided then do not add the entry to array.
    "backgroundImage."effect": this will contain the transition effect for the background image. If its not provided then leave it blank.
    "backgroundVideo": in this there will be array of background videos for the video, you cannot set the value for this.
    "backgroundVideo."name": this will be the name for the background videos file, you cannot set the value for this. If its not provided then do not add the entry to array.
    "backgroundVideo."effect": this will contain the transition effect for the background videos. If its not provided then leave it blank.
    "slides": this is a array that contain multiple slides of the video.
    "slides"."id": the slide id should be unique and cannot be changed once created, like "slide1", "slide2"
    "slides"."content": the content for the slide, don't use any text formatting and keep it precise if the video duration is not long.
    "slides"."totalTime": the total time for the slide, adjust it according to the slide's content, so user can read it.
    "slides"."showAt": the time when the slide will be visible.
    "slides"."hideAt": the time when the slide will hide, and next slide will show.
    "slides"."image": the array of slide's image that will be displayed, you cannot set the value for this.
    "slides"."image"."name": this will be the name for the image file, you cannot set the value for this. If its not provided then do not add the entry to array.
    "slides"."image"."effect": this will contain the transition effect for the image. If its not provided then leave it blank.
    "slides"."video": the array of slide's video that will be displayed, you cannot set the value for this.
    "slides"."video"."name": this will be the name for the video file, you cannot set the value for this. If its not provided then do not add the entry to array.
    "slides"."video"."effect": this will contain the transition effect for the video. If its not provided then leave it blank.
    
    Note:
    When changing or updating content make sure to update the other slide's time based on approximate time taken to read it.`;

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
    * @param {*} prompt 
    * @param {*} context 
    * @returns 
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
    
    }
    catch(error) {
        console.log("GenerativeRun():", error);
        throw error;
    };

    return { context: _context, response: _answer };

}


export { GenerativeRun, GenerativeInit }