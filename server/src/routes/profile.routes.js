import express from "express";
import { stats } from "../controllers/profile.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

router.get("/stats", stats);

export default router;
