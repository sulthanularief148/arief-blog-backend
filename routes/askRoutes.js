import express from "express";
import { askBlogAgent } from "../controllers/askController.js";
const router = express.Router();
router.post("/ask", askBlogAgent);

export default router;
