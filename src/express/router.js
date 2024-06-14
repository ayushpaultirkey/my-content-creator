import express from "express";
import Create from "./controller/project/create.js";
import validate from "./controller/project/validate.js";

const router = express.Router();

router.get("/api/project/create", Create);
router.get("/api/project/validate", validate);

export default router;