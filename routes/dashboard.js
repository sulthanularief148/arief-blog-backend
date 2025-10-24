import express from "express";
import { getDashboardMetrics, recordView, recordClick } from "../controllers/dashboardController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Record a blog view
router.post("/blog/:id/view", recordView);

// Record a blog click
router.post("/blog/:id/click", recordClick);

// Get all dashboard metrics (protected)
router.get("/metrics", authMiddleware, adminOnly, getDashboardMetrics);

export default router;
