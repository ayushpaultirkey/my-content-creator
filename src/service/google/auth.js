import "dotenv/config";
import fs from "fs";
import chalk from "chalk";
import crypto from "crypto";
import { google } from "googleapis";
import { EventEmitter } from "events";
import directory from "#library/directory.js";
import path from "path";

let OAUTH_EVENT = new EventEmitter();


function HasToken(request) {
    if(request.session && request.session.gclient && request.cookies.atk) {
        return true
    }
    else {
        return false;
    };
};


function GetEvent() {
    return OAUTH_EVENT;
};


/**
 * 
 * @param {import("express").Request} request 
 * @returns 
 */
function OAuth2Client(request) {

    // Try and create or read oauth2 client
    try {

        const { session, cookies } = request;
        let _client = null;
        
        if(!session.gclient) {

            // Get oauth2 info
            const _credential = JSON.parse(fs.readFileSync(process.env.GOOGLE_OAUTH2_CLIENT));
            const { client_id, client_secret, redirect_uris } = _credential.installed || _credential.web;

            // Store oauth2 client
            _client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
            
            //
            session.gclient = {
                client_id,
                client_secret,
                redirect_uris
            };
            console.log(chalk.green("/S/Google/Auth/OAuth2Client():"), "OAuth2 new client created");
            
            //
            return _client;

        }
        else {
            
            const { client_id, client_secret, redirect_uris } = session.gclient;
            console.log(chalk.green("/S/Google/Auth/OAuth2Client():"), "OAuth2 client found");

            _client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
            
        };

        if(cookies.atk) {
            _client.setCredentials({
                access_token: cookies.atk
            });
            console.log(chalk.green("/S/Google/Auth/OAuth2Client():"), "OAuth2 access token found in cookie");
        };

        return _client;

    }
    catch(error) {
        console.error(chalk.red("/S/Google/Auth/OAuth2Client():"), error);
        throw new Error("Unable to get auth client");
    };

};


async function OAuth2Callback(request, response, code = "") {

    try {

        //
        const _client = OAuth2Client(request);

        //
        const { tokens } = await _client.getToken(code);
        _client.setCredentials(tokens);

        //
        const _config = {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            secure: request.secure || request.headers["x-forwarded-proto"] === "https"
        };
        response.cookie("atk", tokens.access_token, _config);
        response.cookie("uid", crypto.randomUUID(), _config);

        //
        console.log(chalk.green("/S/Google/Auth/OAuth2Callback():"), "OAuth2 session token set");
        console.log(chalk.green("/S/Google/Auth/OAuth2Callback():"), "OAuth2 credit set");

        //
        return tokens.access_type;

    }
    catch(error) {
        console.error(chalk.red("/S/Google/Auth/OAuth2Callback():"), error);
        throw new Error("Unable to use auth callback");
    };

};


function OAuth2GenerateURL(oauth2 = null) {

    try {

        if(!oauth2) {
            throw new Error("Invalid oauth2");
        };

        //
        console.log(chalk.green("/S/Google/Auth/OAuth2Callback():"), "OAuth2 url created");

        return oauth2.generateAuthUrl({
            access_type: "offline",
            scope: [
                "https://www.googleapis.com/auth/drive",
                "https://www.googleapis.com/auth/youtube",
                "https://www.googleapis.com/auth/yt-analytics.readonly"
            ]
        });

    }
    catch(error) {
        console.error(chalk.red("/S/Google/Auth/OAuth2GenerateURL():"), error);
        throw new Error("Unable to generate auth url");
    }

};


export default {
    OAuth2Client,
    OAuth2Callback,
    GetEvent,
    HasToken,
    OAuth2GenerateURL
};