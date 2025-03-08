import express from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const router = express.Router();

// Admin Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '2h' });
        return res.json({ success: true, token });
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Optional - For portfolio, no need for admin signup if you only want one admin stored in env
// If you want a dynamic admin system, you'd save admins to a database instead.

export default router;
