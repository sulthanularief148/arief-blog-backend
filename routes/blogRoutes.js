import express from 'express';
import {
    addBlog,
    updateBlog,
    deleteBlog,
    getAllBlogs,
    getBlogById,
    getBlogByTitle
} from '../controllers/blogController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/blogs', authMiddleware, addBlog);
router.put('/blogs/:id', authMiddleware, updateBlog);
router.delete('/blogs/:id', authMiddleware, deleteBlog);
router.get('/blogs', getAllBlogs);
router.get('/blogs/:id', getBlogById);
router.get('/blogs/:title', getBlogByTitle);


export default router;
