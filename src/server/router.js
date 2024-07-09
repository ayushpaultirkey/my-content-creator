import express from "express";

import SUpdate from "./controller/frame/slide/update.js";

import PRender from "./controller/frame/project/render.js";
import PCreate from "./controller/frame/project/create.js";
import PUpdate from "./controller/frame/project/update.js";
import PValidate from "./controller/frame/project/validate.js";

import EValidate from "./controller/frame/project/export/validate.js";
import EGet from "./controller/frame/project/export/get.js";

import AFetch from "./controller/frame/asset/fetch.js";
import AUpload from "./controller/frame/asset/upload.js";

import GAuth from "./controller/google/auth.js";
import GAuthStatus from "./controller/google/auth/status.js";
import GAuthCallback from "./controller/google/auth/callback.js";

import GGemini from "./controller/frame/prompt.js";

import DGetFile from "./controller/google/drive/getfile.js";
import DImport from "./controller/frame/drive/import.js";
import DUpload from "./controller/frame/drive/upload.js";
import YUpload from "./controller/frame/youtube/upload.js";

import AReport from "./controller/analytics/report.js";
import APrompt from "./controller/analytics/prompt.js";
import AHistory from "./controller/analytics/history.js";
import AVideos from "./controller/analytics/videos.js";
import AVideo from "./controller/analytics/video.js";
import ANVideo from "./controller/analytics/analyze/video.js";
import YComment from "./controller/analytics/video/comment.js";
import YCPrompt from "./controller/analytics/video/comment/prompt.js";
import YCSend from "./controller/analytics/video/comment/send.js";


import Auth from "#service/google/auth.js";
import chalk from "chalk";


//
const router = express.Router();

router.use((request, response, next) => {

    if(!request.session.gclient) {
        Auth.OAuth2Client(request);
        console.log(chalk.green("router.use():"), "oauth2 client created");
    };

    next();

});
router.use((request, response, next) => {

    let uid = request.cookies.uid;
    if(!uid) {
        uid = crypto.randomUUID();
        response.cookie("uid", uid, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            secure: request.secure || request.headers["x-forwarded-proto"] === "https"
        });
    };

    request.uid = uid;
    next();

});

// Project
router.post("/api/frame/project/create", PCreate.POSTCreate);
router.get("/api/frame/project/create", PCreate.GETCreate);

router.get("/api/frame/project/validate", PValidate);
router.get("/api/frame/project/update", PUpdate);
router.get("/api/frame/project/render", PRender);
router.get("/api/frame/slide/update", SUpdate);
router.get("/api/frame/drive/import", DImport);
router.get("/api/frame/drive/upload", DUpload);
router.get("/api/frame/youtube/upload", YUpload);
router.get("/api/frame/asset/fetch", AFetch);
router.post("/api/frame/asset/upload", AUpload);
router.post("/api/frame/prompt", GGemini);

// Export
router.get("/api/frame/project/export/get", EGet);
router.get("/api/frame/project/export/validate", EValidate);

// Asset
router.post("/api/analytics/prompt", APrompt);
router.get("/api/analytics/history", AHistory);
router.get("/api/analytics/report", AReport);
router.get("/api/analytics/videos", AVideos);
router.get("/api/analytics/video", AVideo);
router.get("/api/analytics/video/comment", YComment);
router.get("/api/analytics/video/comment/prompt", YCPrompt);
router.get("/api/analytics/video/comment/send", YCSend);
router.get("/api/analytics/analyze/video", ANVideo);

// Gemini

// Google
router.get("/api/google/auth", GAuth);
router.get("/api/google/auth/status", GAuthStatus);
router.get("/api/google/auth/callback", GAuthCallback);

// Drive
router.get("/api/google/drive/getfile", DGetFile);

//
export default router;