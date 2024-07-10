import chalk from "chalk";
import GAuth from "#service/google/auth.js";


/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Auth(request, response) {
    
    //
    try {

        //
        const _auth = GAuth.OAuth2Client(request);
        const _authUrl = GAuth.OAuth2GenerateURL(_auth);

        //
        response.redirect(_authUrl);
        
    }
    catch(error) {

        //
        console.log(chalk.red("/google/auth:"), error);
        response.send("Unable to authenticate");

    };

};