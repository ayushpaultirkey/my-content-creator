import "dotenv/config";
import open from "open";
import cors from "cors";
import path from "path";
import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import compression from "compression";
import viteExpress from "vite-express";

import router from "./router.js";
import Cache from "../service/asset/cache.js";
import Gemini from "./../service/google/gemini.js";
import directory from "./../library/directory.js";

//
export default function init() {

    // Initialize Cache
    Cache.Initialize();

    // Start generative ai
    Gemini.Initialize();

    // Create express app
    const app = express();

    // Use bodyParser middleware to parse JSON bodies
    app.use(bodyParser.json());

    // Use CORS middleware
    app.use(cors());

    // Set session
    app.use(session({
        secret: 'APP_SESSION',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    }));

    // Use response compression
    app.use(compression());

    // Add project path
    const { __root } = directory();
    app.use("/project", express.static(path.join(__root, "/project/")));
    
    // Serve files
    app.use("/", router);
    
    //Create server
    viteExpress.config({ mode: process.env.NODE_ENV || "development" });
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