import "dotenv/config";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import Container from "#library/container.js";
import chalk from "chalk";
import Asset from "#service/asset.js";



/**
    * 
*/
function Initialize(id, systemInstruction, responseMimeType = "text/plain") {

    try {

        const _data = Container.Get(id);
        if(!_data) {
    
            const _generative = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API);
            const _filemanager = new GoogleAIFileManager(process.env.GOOGLE_GEMINI_API);
            const _model = _generative.getGenerativeModel({
                model: "gemini-1.5-flash",
                systemInstruction: {
                    role: "system",
                    parts: [{ text: systemInstruction }]
                },
                generationConfig: {
                    responseMimeType: responseMimeType
                },
                safetySettings: [
                    {
                      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                    },
                    {
                      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                    },
                    {
                      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                    },
                    {
                      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
                    }
                ]
            });
    
            Container.Set(id, {
                generative: _generative,
                filemanager: _filemanager,
                model: _model
            });

            console.log(chalk.green("/S/Google/Gemini.Initialize():"), `${id} gemini instance added to container`);
    
        };

    }
    catch(error) {
        console.log(chalk.red("/S/Google/Gemini.Initialize():"), error);
        throw error;
    }

};


/**
    * 
    * @param {*} file 
    * @param {*} history 
    * @returns 
*/
async function PromptFile(id, file = {}, history = [], validate = true) {

    // Try and upload asset
    try {

        // Log
        console.log(chalk.green("/S/Google/Gemini.PromptFile():"), "Multimodel prompt started");

        // Check if the file type is not supported for the prompt,
        // then pre process it
        if(file.mimetype.includes("pdf")) {

            const _text = await Asset.ReadPDF(file.path);
            const _format = _text.join(" ");

            // Add text to history
            history.push({
                role: "user",
                parts: [{
                    text: _format
                }]
            });

            // Return the text
            return { file: null, history: history };

        };

        //
        const { filemanager } = Container.Get(id);
        if(!filemanager) {
            throw new Error("Filemanager not found");
        };

        // Validate the history before prompting,
        // this can check for valid asset urls
        if(validate) {
            for(var i = 0, len = history.length; i < len; i++) {
                try {
                    if(history[i].role == "user" && typeof(history[i].parts[0].fileData) !== "undefined") {
                        const _uri = history[i].parts[0].fileData.fileUri.split("/files/")[1];
                        await filemanager.getFile(_uri);
                    };
                }
                catch(error) {
                    delete history[i].parts[0].fileData;
                    history[i].parts[0].text = "Cannot view asset since it was expired after 48 hours.";
                    console.log(chalk.yellow("/S/Google/Gemini.PromptFile()"), "File not exists, it will be removed from history");
                };
            };
        };

        // Upload file to file manager
        const _upload = await filemanager.uploadFile(file.path, {
            mimeType: file.mimetype,
            displayName: file.filename,
        });
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
        console.log(chalk.green("/S/Google/Gemini.PromptFile():"), `Uploaded file ${_file.name}`);

        // Return the file with updated history
        return { file: _file, history: history };

    }
    catch(error) {

        console.log(chalk.red("/S/Google/Gemini.PromptFile():"), error);
        throw new Error("Unable to prompt using file");

    };

};


/**
    * 
    * @param {*} prompt 
    * @param {*} history 
    * @returns 
*/
async function Prompt(id, prompt = "", history = []) {

    try {

        // Get model from the container
        const { model } = Container.Get(id);
        if(!model) {
            throw new Error("Model not found in container");
        };

        // Log
        console.log(chalk.green("/S/Google/Gemini.Prompt():"), "Prompt started");

        // Set the model message history
        let _chat = model.startChat({
            history: history
        });

        // Send message to model and get response
        let _result = await _chat.sendMessage(prompt);
        let _answer = _result.response.text();

        // Log
        console.log(chalk.green("/S/Google/Gemini.Prompt():"), "Prompt ended");

        // Return data
        return { answer: _answer, history: history };

    }
    catch(error) {
        console.log(chalk.red("/S/Google/Gemini.Prompt():"), error);
        throw new Error("Unable to generate answer");
    };

};



export default { Prompt, PromptFile, Initialize }