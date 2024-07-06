import Auth from "#service/google/auth.js";

/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function AuthCallback(request, response) {

    //
    const _authEvent = Auth.GetEvent();

    //
    try {

        //
        const { code } = request.query;
        await Auth.OAuth2Callback(request, response, code);

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