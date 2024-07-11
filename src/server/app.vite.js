import "dotenv/config";
import open from "open";
import path from "path";
import express from "express";
import crypto from "crypto";
import session from "express-session";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import compression from "compression";
import viteExpress from "vite-express";
import chalk from "chalk";

import router from "./router.js";
import Config from "./../config/@config.js";
import Cache from "#service/asset/cache.js";
import Gemini from "#service/google/gemini.js";
import directory from "#library/directory.js";

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
        secret: crypto.randomUUID(),
        resave: false,
        saveUninitialized: true
    }));

    // Use response compression
    app.use(compression());

    // Add project path
    const { __root } = directory();
    app.use("/project", express.static(path.join(__root, "/project/")));
    
    // Add router
    app.use("/", router);
    
    // Create server
    const mode = process.env.NODE_ENV;
    const port = (mode === "production") ? 3000 : 3000;

    viteExpress.config({ mode: mode || "development" });
    viteExpress.listen(app, port, () => {

        // Log the server starting
        console.log(chalk.green("init():"), "Server started !")
        console.log(chalk.green("init():"), `http://localhost:${port}/`);

        // Open the default browser
        if(mode !== "production") {
            open(`http://localhost:${port}/`);
        };
        
    });

};