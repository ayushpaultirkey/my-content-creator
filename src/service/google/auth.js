import "dotenv/config";
import fs from "fs";
import { google } from "googleapis";
import { EventEmitter } from "events";

let OAUTH_EVENT = new EventEmitter();
let OAUTH2_CLIENT = null;


/**
    * 
    * @param {*} request 
    * @returns 
*/
function HasAuthToken(request) {
    if(request.session && request.session.gtoken) {
        return true
    }
    else {
        return false;
    };
};

/**
    * 
    * @param {*} request 
    * @returns 
*/
function GetAuthToken(request) {
    if(request.session && request.session.gtoken) {
        return request.session.gtoken;
    }
    else {
        return null;
    };
};


/**
    * 
    * @param {*} request 
    * @param {*} token 
*/
function SetAuthToken(request, token) {
    request.session.gtoken = token;
};


/**
    * 
    * @returns 
*/
function GetAuthEvent() {
    return OAUTH_EVENT;
};


/**
    * 
    * @returns 
*/
function OAuth2Client() {

    // Try and create or read oauth2 client
    try {

        // Check oauthh2 its valid
        if(!OAUTH2_CLIENT) {

            // Get oauth2 info
            const _credential = JSON.parse(fs.readFileSync(process.env.GOOGLE_OAUTH2_CLIENT));
            const { client_id, client_secret, redirect_uris } = _credential.installed || _credential.web;

            // Store oauth2 client
            OAUTH2_CLIENT = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

            // Log
            console.error("Service/Google/Auth/OAuth2Client(): OAuth2 client created");
            
        };

        //
        return OAUTH2_CLIENT;

    }
    catch(error) {
        console.error("Service/Google/Auth/OAuth2Client(): Error initializing OAuth2 client:", error);
        throw error;
    };

};


/**
    * 
    * @param {*} code 
    * @returns 
*/
function OAuth2Callback(code = "") {

    try {

        const _client = OAuth2Client();

        return new Promise((resolve, reject) => {
            _client.getToken(code, (error, token) => {
                if(error) {
                    console.error("Service/Google/Auth/OAuth2Callback(): Error exchanging code for token:", error);
                    reject(error);
                    return;
                };
                _client.setCredentials(token);
                resolve(token.access_token);
            });
        });

    }
    catch(error) {
        console.error("Service/Google/Auth/OAuth2Callback():", error);
        throw error;
    };

};


function OAuth2GenerateURL(oauth2 = null) {

    try {

        if(!oauth2) {
            throw new Error("Invalid oauth2");
        };

        return oauth2.generateAuthUrl({
            access_type: "offline",
            scope: [
                "https://www.googleapis.com/auth/drive",
                "https://www.googleapis.com/auth/youtube.upload"
            ]
        });

    }
    catch(error) {
        console.error("Service/Google/Auth/OAuth2GenerateURL():", error);
        throw error;
    }

};


export default {
    OAuth2Client,
    OAuth2Callback,
    GetAuthEvent,
    GetAuthToken,
    SetAuthToken,
    HasAuthToken,
    OAuth2GenerateURL
};