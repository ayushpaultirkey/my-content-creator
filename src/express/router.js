import express from "express";
import Create from "./controller/project/create.js";
import validate from "./controller/project/validate.js";
import update from "./controller/slide/update.js";
import Run from "./controller/generative/run.js";

const router = express.Router();

router.get("/api/project/create", Create);
router.get("/api/project/validate", validate);

router.get("/api/slide/update", update);

router.get("/api/generative/run", Run);

export default router;