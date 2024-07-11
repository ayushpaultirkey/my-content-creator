import chalk from "chalk";
import Auth from "#service/google/auth.js";

/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function AuthCallback(request, response) {

    // Get the auth event
    const _authEvent = Auth.GetEvent();

    try {

        // Get the callback code from th oauth
        const { code } = request.query;
        await Auth.OAuth2Callback(request, response, code);

        // When login is success full, send event and response
        _authEvent.emit("login", { success: true });
        response.send("Success login, you can close this window now.");
        
    }
    catch(error) {
        
        // Set error message
        console.log(chalk.red("/google/auth/callback:"), error);
        _authEvent.emit("login", { success: false });
        response.send("Unable to get token");

    };

};