import express from "express";

import Run from "./controller/prompt/run.js";
import update from "./controller/slide/update.js";
import Create from "./controller/project/create.js";
import PUpdate from "./controller/project/update.js";
import validate from "./controller/project/validate.js";

import Fetch from "./controller/asset/fetch.js";
import Upload from "./controller/asset/upload.js";

import GAuth from "#controller/google/auth.js";
import GAuthStatus from "#controller/google/auth/status.js";
import GAuthCallback from "#controller/google/auth/callback.js";

import Gemini from "#controller/google/gemini.js";
import DGetFile from "#controller/google/drive/getfile.js";
import DImport from "#controller/google/drive/import.js";

//
const router = express.Router();

//
router.post("/api/project/create", Create);

router.get("/api/project/validate", validate);
router.get("/api/project/update", PUpdate);

router.get("/api/slide/update", update);

router.get("/api/prompt/run", Run);

router.get("/api/asset/fetch", Fetch);
router.post("/api/asset/upload", Upload);

router.post("/api/google/gemini", Gemini);

router.get("/api/google/auth", GAuth);
router.get("/api/google/auth/status", GAuthStatus);
router.get("/api/google/auth/callback", GAuthCallback);

router.get("/api/google/drive/getfile", DGetFile);
router.get("/api/google/drive/import", DImport);
router.get("/api/google/drive/upload", Fetch);

//
export default router;