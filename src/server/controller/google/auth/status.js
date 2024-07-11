import chalk from "chalk";
import Auth from "#service/google/auth.js";


/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function AuthStatus(request, response) {
    
    try {

        // Get the auth event
        const _authEvent = Auth.GetEvent();

        // Set header for SSE
        response.setHeader("Content-Type", "text/event-stream");
        response.setHeader("Cache-Control", "no-cache");
        response.setHeader("Connection", "keep-alive");
        response.setHeader("Content-Encoding", "none");
        
        // Send data function
        const _send = (data) => {
            response.write(`data: ${JSON.stringify(data)}\n\n`);
        };

        // Function to send data
        const _listener = (data) => {
            _send(data);
        };

        // Event on when login is called
        _authEvent.on("login", _listener);

        // Event when connection is closed
        request.on("close", () => {
            _authEvent.off("login", _listener);
        });

        // Set initial value
        _listener({ success: Auth.HasToken(request) });

    }
    catch(error) {

        console.log(chalk.red("/google/auth/status:"), error);

    };

};