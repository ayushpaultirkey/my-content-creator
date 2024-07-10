import os from "os";
import path from "path";
import { FFCreator } from "ffcreator";

import directory from "#library/directory.js";
import chalk from "chalk";

//
const { __root } = directory();

//

const platform = os.platform();
if(platform === "win32") {
    FFCreator.setFFmpegPath(path.join(__root, "/library/ffmpeg.exe"));
    FFCreator.setFFprobePath(path.join(__root, "/library/ffprobe.exe"));
    console.log(chalk.yellow("[NOTE]: Windows environment detected, make sure to download ffmpeg in /library folder, or run the 'npm run download' command"));
}
else {
    console.log(chalk.yellow("[NOTE]: Linux environment detected, make sure to install ffmpeg"));
};

//
export default {
    S_CREATE_SSE: "S_CREATE",
    E_GEMINI: "FRAME_GEMINI",
    S_GEMINI_INSTRUCTION: `You have to assist the user on creating a content for a video. You should only respond in json data and nothing else is accepted, the json format is explained below.
    {
    "response": string,
    "title": string,
    "description": string,
    "keyword": string,
    "audio": [{ name: string }],
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
    "audio": an array of audio, you cannot set the value for this, until and unless user tell you.
    "audio"."name": this will be the name for the image file, you cannot set the value for this, until and unless user tell you.
    "slides": this is a array that contain multiple slides of the video.
    "slides"."id": the slide id should be unique and cannot be changed once created, it should be like this: "slide1", "slide2".
    "slides"."content": the content for the slide, don't use any text formatting and keep it precise if the video duration is not long.
    "slides"."image": the array of slide's image that will be displayed, you cannot set the value for this, until and unless user tell you.
    "slides"."image"."name": this will be the name for the image file, you cannot set the value for this. The default value will be [{ name: slide.id.jpg, effect: "" }] where "slide.id" is the current slide's id.
    "slides"."image"."effect": this will contain the transition effect for the image. If its not provided then leave it blank.
    "slides"."video": the array of slide's video that will be displayed, you cannot set the value for this. If its not provided then do not add the entry to array, remember don't add video on your own.
    "slides"."video"."name": this will be the name for the video file, you cannot set the value for this.
    "slides"."video"."effect": this will contain the transition effect for the video. If its not provided then leave it blank.
    
    Make sure to always create a video content on first try, so user can modify things later on, remember to not create an empty content. And don't add video in slides on you own.`
}