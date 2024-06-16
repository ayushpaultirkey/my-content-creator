import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";


let GENERATIVE = null;
let MODEL = null;


function GenerativeInit() {

    const _instruction =
    `You have to assist the user on creating a content for a video. You can only respond in json as the format is provided below, the explanation is also provided.
    {
    "response": string,
    "title": string,
    "description": string,
    "totalTime": int,
    "slide": {
    "id": string,
    "content": string,
    "totalTime": int,
    "showAt": int,
    "hideAt": int
    }
    }
    The explanation for the json data format:
    "response": this the response for the thing you have been asked, you can write anything here in response for the user.
    "title": is the title for the video, keep it precise and accurate.
    "description": the detailed description for the video, use seo to make the description stand out by using emojis, hashtag or other things and easy to understand.
    "totalTime": the total time of the video based on the time of the slides.
    "slides": this is a array that contain multiple slides of the video.
    "slides"."id": the slide id should be unique and cannot be changed once created, like "slide1", "slide2"
    "slides"."content": the content for the slide, dont use any text formatting and keep it precise if the video duration is not long.
    "slides"."totalTime": the total time for the slide, adjust it according to the slide's content, so user can read it.
    "slides"."showAt": the time when the slide will be visible.
    "slides"."hideAt": the tme when the slide will hide, and next slide will show`;

    GENERATIVE = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_API);
    MODEL = GENERATIVE.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: {
            role: "system",
            parts: [{ text: _instruction }]
        }
    });

};


async function GenerativeRun(prompt = "", history = { context: [], message: [] }) {

    const _context = history.context;
    const _message = history.message;

    try {
        
        for(const [input, response] of _context) {
            _message.push({ role: "user", parts: [{ "text": input }] });
            _message.push({ role: "model", parts: [{ "text": response }] });
        };
    
        const _chat = MODEL.startChat({
            history: _message,
            generationConfig: {
                maxOutputTokens: 100,
                
            }
        });
    
        const _result = await _chat.sendMessage(prompt);
        const _response = await _result.response;
        const _responseText = _response.text();
    
        _context.push([prompt, _responseText]);
    
    }
    catch(error) {
        throw error;
    }

    return { context: _context, message: _message };

}


export { GenerativeRun, GenerativeInit }