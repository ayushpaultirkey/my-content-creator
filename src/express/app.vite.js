import "dotenv/config";
import open from "open";
import express from "express";
import viteExpress from "vite-express";
import compression from "compression";

import router from "./router.js";
import { GenerativeInit } from "./service/gemini.js";
import { InitializeCache } from "./service/cache.js";

//
export default function init() {

    // Initialize Cache
    InitializeCache();

    // Start generative ai
    GenerativeInit();

    // Create express app
    const app = express();

    // Use response compression
    app.use(compression());
    
    // Serve files
    app.use("/", router);
    
    //Create server
    viteExpress.config({ mode: "development" });
    viteExpress.listen(app, 3000, () => {

        // Log the server starting
        console.log("init(): Server started !")
        console.log("init(): http://localhost:3000/");

        // Open the default browser
        if(process.env.NODE_ENV !== "production") {
            open("http://localhost:3000/");
        };
        
    });

};