import express from "express";
import Create from "./controller/project/create.js";
import validate from "./controller/project/validate.js";
import PUpdate from "./controller/project/update.js";

import update from "./controller/slide/update.js";

import Run from "./controller/prompt/run.js";

import Upload from "./controller/asset/upload.js";
import Fetch from "./controller/asset/fetch.js";

const router = express.Router();

router.get("/api/project/create", Create);
router.get("/api/project/validate", validate);
router.get("/api/project/update", PUpdate);

router.get("/api/slide/update", update);

router.get("/api/prompt/run", Run);

router.get("/api/asset/fetch", Fetch);
router.post("/api/asset/upload", Upload);

export default router;