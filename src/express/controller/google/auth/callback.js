import { GetAuthEvent, OAuth2Callback, SetAuthToken } from "../../../../service/google.js";

/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function AuthCallback(request, response) {

    //
    const _authEvent = GetAuthEvent();

    //
    try {

        //
        const _code = request.query.code;
        const _token = await OAuth2Callback(_code);

        //
        SetAuthToken(request, _token);

        //
        _authEvent.emit("login", { success: true });

        //
        response.send("Success login, you can close this window now.");
        
    }
    catch(error) {
        
        //
        console.log("/google/auth/callback:", error);

        //
        _authEvent.emit("login", { success: false });

        //
        response.send("Unable to get token");

    };

};