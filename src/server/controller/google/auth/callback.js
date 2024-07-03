import Google from "#service/google.js";

/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function AuthCallback(request, response) {

    //
    const _authEvent = Google.Auth.GetAuthEvent();

    //
    try {

        //
        const _code = request.query.code;
        const _token = await Google.Auth.OAuth2Callback(_code);

        //
        Google.Auth.SetAuthToken(request, _token);

        //
        _authEvent.emit("login", { success: true });
        response.send("Success login, you can close this window now.");
        
    }
    catch(error) {
        
        //
        _authEvent.emit("login", { success: false });

        //
        console.log("/google/auth/callback:", error);
        response.send("Unable to get token");

    };

};