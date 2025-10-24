// backend/routes/askRoutes.js
import express from "express";
import { askBlogAgent } from "../controllers/askController.js";

const router = express.Router();

// final endpoint: POST /api/ask/ask
router.post("/ask", askBlogAgent);

export default router;
