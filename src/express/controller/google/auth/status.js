import { GetAuthEvent, GetAuthToken } from "../../../../service/google.js";

/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function AuthStatus(request, response) {
    
    //
    try {

        //
        const _authEvent = GetAuthEvent();

        //
        response.setHeader("Content-Type", "text/event-stream");
        response.setHeader("Cache-Control", "no-cache");
        response.setHeader("Connection", "keep-alive");
        response.setHeader("Content-Encoding", "none");
        
        //
        const _send = (data) => {
            response.write(`data: ${JSON.stringify(data)}\n\n`);
        };

        //
        const _listener = (data) => {
            _send(data);
        };

        //
        _authEvent.on("login", _listener);

        //
        request.on("close", () => {
            _authEvent.off("login", _listener);
        });

        //
        _listener({ success: ((GetAuthToken(request) == null) ? false : true) });

    }
    catch(error) {

        //
        console.log("/google/auth/status:", error);

    };

};