import express from "express";

import SUpdate from "./controller/slide/update.js";

import PCreate from "./controller/project/create.js";
import PUpdate from "./controller/project/update.js";
import PValidate from "./controller/project/validate.js";

import AFetch from "./controller/asset/fetch.js";
import AUpload from "./controller/asset/upload.js";

import GAuth from "#controller/google/auth.js";
import GAuthStatus from "#controller/google/auth/status.js";
import GAuthCallback from "#controller/google/auth/callback.js";

import GGemini from "#controller/google/gemini.js";

import DGetFile from "#controller/google/drive/getfile.js";
import DImport from "#controller/google/drive/import.js";

//
const router = express.Router();

// Project
router.post("/api/project/create", PCreate);
router.get("/api/project/validate", PValidate);
router.get("/api/project/update", PUpdate);

// Slide
router.get("/api/slide/update", SUpdate);

// Asset
router.post("/api/asset/upload", AUpload);
router.get("/api/asset/fetch", AFetch);

// Gemini
router.post("/api/google/gemini", GGemini);

// Google
router.get("/api/google/auth", GAuth);
router.get("/api/google/auth/status", GAuthStatus);
router.get("/api/google/auth/callback", GAuthCallback);

// Drive
router.get("/api/google/drive/getfile", DGetFile);
router.get("/api/google/drive/import", DImport);
//router.get("/api/google/drive/upload", Fetch);

//
export default router;