import express from "express";

import SUpdate from "./controller/slide/update.js";

import PRender from "./controller/frame/project/render.js";
import PCreate from "./controller/frame/project/create.js";
import PUpdate from "./controller/frame/project/update.js";
import PValidate from "./controller/frame/project/validate.js";

import EValidate from "./controller/frame/project/export/validate.js";
import EGet from "./controller/frame/project/export/get.js";

import AFetch from "./controller/asset/fetch.js";
import AUpload from "./controller/asset/upload.js";

import GAuth from "./controller/google/auth.js";
import GAuthStatus from "./controller/google/auth/status.js";
import GAuthCallback from "./controller/google/auth/callback.js";

import GGemini from "./controller/google/gemini.js";

import DGetFile from "./controller/google/drive/getfile.js";
import DImport from "./controller/google/drive/import.js";
import DUpload from "./controller/google/drive/upload.js";

import YUpload from "./controller/google/youtube/youtube.js";

import AReport from "./controller/analytics/report.js";
import APrompt from "./controller/analytics/prompt.js";
import AHistory from "./controller/analytics/history.js";


//
const router = express.Router();

// Project
router.post("/api/frame/project/create", PCreate.POSTCreate);
router.get("/api/frame/project/create", PCreate.GETCreate);
router.get("/api/project/validate", PValidate);
router.get("/api/project/update", PUpdate);
router.get("/api/project/render", PRender);

// Export
router.get("/api/project/export/get", EGet);
router.get("/api/project/export/validate", EValidate);

// Slide
router.get("/api/slide/update", SUpdate);

// Asset
router.post("/api/asset/upload", AUpload);
router.get("/api/asset/fetch", AFetch);

router.get("/api/analytics/report", AReport);
router.get("/api/analytics/prompt", APrompt);
router.get("/api/analytics/history", AHistory);

// Gemini
router.post("/api/google/gemini", GGemini);

// Google
router.get("/api/google/auth", GAuth);
router.get("/api/google/auth/status", GAuthStatus);
router.get("/api/google/auth/callback", GAuthCallback);

// Drive
router.get("/api/google/drive/getfile", DGetFile);
router.get("/api/google/drive/import", DImport);
router.get("/api/google/drive/upload", DUpload);

router.get("/api/google/youtube/upload", YUpload);

//
export default router;