import Google from "../../../service/google.js";

/**
    * 
    * @param {import("express").Request} request 
    * @param {import("express").Response} response 
*/
export default async function Auth(request, response) {
    
    //
    try {

        //
        const _auth = Google.OAuth2Client();
        const _authUrl = Google.OAuth2GenerateURL(_auth);

        //
        response.redirect(_authUrl);
        
    }
    catch(error) {

        //
        console.log("/google/auth:", error);

        //
        response.send("Unable to authenticate");

    };

};