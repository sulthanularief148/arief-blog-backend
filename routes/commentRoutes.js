import express from 'express';
const router = express.Router();
import { getComments, addComment } from '../controllers/commentController.js';
// Get all comments for a blog post
router.get("/:postId", getComments);
// Add a new comment
router.post("/add", addComment);

export default router
