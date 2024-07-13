import express from "express";
import crypto from "crypto";
import chalk from "chalk";
import Auth from "#service/google/auth.js";

// Frame
import fGemini from "./controller/frame/prompt.js";
import fpRender from "./controller/frame/project/render.js";
import fpCreate from "./controller/frame/project/create.js";
import fpUpdate from "./controller/frame/project/update.js";
import fpDelete from "./controller/frame/project/delete.js";
import fpValidate from "./controller/frame/project/validate.js";
import fpeGet from "./controller/frame/project/export/get.js";
import fpeValidate from "./controller/frame/project/export/validate.js";
import fsUpdate from "./controller/frame/slide/update.js";
import faFetch from "./controller/frame/asset/fetch.js";
import faUpload from "./controller/frame/asset/upload.js";
import fdImport from "./controller/frame/drive/import.js";
import fdUpload from "./controller/frame/drive/upload.js";
import fyUpload from "./controller/frame/youtube/upload.js";

// Google
import gAuth from "./controller/google/auth.js";
import gAuthStatus from "./controller/google/auth/status.js";
import gAuthCallback from "./controller/google/auth/callback.js";
import gdGetFile from "./controller/google/drive/getfile.js";

// Analytics
import aReport from "./controller/analytics/report.js";
import aPrompt from "./controller/analytics/prompt.js";
import aHistory from "./controller/analytics/history.js";
import aVideos from "./controller/analytics/videos.js";
import aVideo from "./controller/analytics/video.js";
import anVideo from "./controller/analytics/analyze/video.js";
import avComment from "./controller/analytics/video/comment.js";
import avcPrompt from "./controller/analytics/video/comment/prompt.js";
import avcSend from "./controller/analytics/video/comment/send.js";


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
        console.log(chalk.green("router.use():"), "new uid created");
    };
    request.uid = uid;
    next();
});

// Frame
router.post("/api/frame/project/create", fpCreate.POSTCreate);
router.get("/api/frame/project/create", fpCreate.GETCreate);

router.get("/api/frame/project/validate", fpValidate);
router.get("/api/frame/project/update", fpUpdate);
router.get("/api/frame/project/render", fpRender);
router.get("/api/frame/project/delete", fpDelete);
router.get("/api/frame/slide/update", fsUpdate);
router.get("/api/frame/drive/import", fdImport);
router.get("/api/frame/drive/upload", fdUpload);
router.get("/api/frame/youtube/upload", fyUpload);
router.get("/api/frame/asset/fetch", faFetch);
router.post("/api/frame/asset/upload", faUpload);
router.post("/api/frame/prompt", fGemini);

router.get("/api/frame/project/export/get", fpeGet);
router.get("/api/frame/project/export/validate", fpeValidate);

// Analytics
router.post("/api/analytics/prompt", aPrompt);
router.get("/api/analytics/history", aHistory);
router.get("/api/analytics/report", aReport);
router.get("/api/analytics/videos", aVideos);
router.get("/api/analytics/video", aVideo);
router.get("/api/analytics/video/comment", avComment);
router.get("/api/analytics/video/comment/prompt", avcPrompt);
router.get("/api/analytics/video/comment/send", avcSend);
router.get("/api/analytics/analyze/video", anVideo);

// Google
router.get("/api/google/auth", gAuth);
router.get("/api/google/auth/status", gAuthStatus);
router.get("/api/google/auth/callback", gAuthCallback);
router.get("/api/google/drive/getfile", gdGetFile);

//
export default router;