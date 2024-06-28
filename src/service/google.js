import "dotenv/config";
import { google } from "googleapis";
import { EventEmitter } from "events";


let G_AUTH_EVENT = new EventEmitter();
let O_AUTH2_CLIENT = null;


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
    return G_AUTH_EVENT;
};


/**
    * 
    * @returns 
*/
function OAuth2Client() {

    //
    try {

        //
        if(!O_AUTH2_CLIENT) {

            //
            O_AUTH2_CLIENT = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                [ process.env.GOOGLE_REDIRECT_URIS ]
            );
            
        };

        //
        return O_AUTH2_CLIENT;

    }
    catch(error) {
        console.error("Service/Google/OAuth2Client(): Error initializing OAuth2 client:", error);
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
                    console.error("Service/Google/OAuth2Callback(): Error exchanging code for token:", error);
                    reject(error);
                    return;
                }
                _client.setCredentials(token);
                resolve(token.access_token);
            });
        });

    }
    catch(error) {
        console.error("Service/Google/OAuth2Callback(): Error exchanging code for token:", error);
        throw error;
    };

};


export { OAuth2Client, OAuth2Callback, GetAuthEvent, GetAuthToken, SetAuthToken, HasAuthToken }