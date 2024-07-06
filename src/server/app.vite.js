import "dotenv/config";
import open from "open";
import path from "path";
import express from "express";
import crypto from "crypto";
import session from "express-session";
import cookieParser from 'cookie-parser';
import bodyParser from "body-parser";
import compression from "compression";
import viteExpress from "vite-express";

import router from "./router.js";
import Cache from "../service/asset/cache.js";
import Gemini from "./../service/google/gemini.js";
import Config from "./../config/@config.js";
import directory from "./../library/directory.js";
import Auth from "./../service/google/auth.js";

//
export default function init() {

    // Initialize Cache
    Cache.Initialize();
    
    // Start generative ai
    Gemini.Initialize(Config.Frame.E_GEMINI, Config.Frame.S_GEMINI_INSTRUCTION, "application/json");
    Gemini.Initialize(Config.Analytics.E_GEMINI, Config.Analytics.S_GEMINI_INSTRUCTION);

    // Create express app
    const app = express();

    // Use bodyParser middleware to parse JSON bodies
    app.use(bodyParser.json());
    app.use(cookieParser());

    // Set session
    app.use(session({
        secret: 'APP_SESSION',
        resave: false,
        saveUninitialized: true
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