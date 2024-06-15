import express from "express";
import Create from "./controller/project/create.js";
import validate from "./controller/project/validate.js";
import update from "./controller/project/update.js";

const router = express.Router();

router.get("/api/project/create", Create);
router.get("/api/project/validate", validate);
router.get("/api/project/update", update);

export default router;