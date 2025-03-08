import * as BlogModel from '../models/blogModel.js';
import pool from '../config/db.js';

// export const addBlog = async (req, res) => {
//     // Check if req.body is an array (for bulk insert) or an object (single insert)
//     const blogs = Array.isArray(req.body) ? req.body : [req.body]; // Normalize to array

//     // Validation: Check all blogs have required fields
//     for (const blog of blogs) {
//         const { title, description, author, date, images, details } = blog;

//         if (!title || !description || !author || !date || !details) {
//             return res.status(400).json({ error: "All fields are required" });
//         }
//     }

//     try {
//         const insertResults = [];

//         for (const blog of blogs) {
//             const { title, description, author, date, images, details } = blog;

//             const [result] = await pool.query(
//                 "INSERT INTO blogs (title, description, author, date, images, details) VALUES (?, ?, ?, ?, ?, ?)",
//                 [title, description, author, date, JSON.stringify(images), details]
//             );

//             insertResults.push({
//                 message: "Blog created successfully",
//                 blogId: result.insertId,
//             });
//         }

//         res.status(201).json({
//             message: "Blogs processed successfully",
//             results: insertResults,
//         });
//     } catch (error) {
//         console.error("Database error:", error);
//         res.status(500).json({ error: error.message });
//     }
// };


export const addBlog = async (req, res) => {
    const blogs = Array.isArray(req.body) ? req.body : [req.body];

    for (const blog of blogs) {
        const { title, description, author, date, images, content } = blog;

        if (!title || !description || !author || !date || !content) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Ensure `content` is properly structured (e.g., JSON format)
        // const formattedContent = typeof content === 'object'
        //     ? JSON.stringify(content)
        //     : content;
        const formattedContent = JSON.stringify(content);

        if (!formattedContent || formattedContent === 'null') {
            return res.status(400).json({ error: "Content cannot be empty" });
        }
    }

    try {
        const insertResults = [];

        for (const blog of blogs) {
            const { title, description, author, date, images, content } = blog;

            const formattedContent = typeof content === 'object'
                ? JSON.stringify(content)
                : content;

            const [result] = await pool.query(
                "INSERT INTO blogs (title, description, author, date, images, content) VALUES (?, ?, ?, ?, ?, ?)",
                [title, description, author, date, JSON.stringify(images), formattedContent]
            );

            insertResults.push({
                message: "Blog created successfully",
                blogId: result.insertId,
            });
        }

        res.status(201).json({
            message: "Blogs processed successfully",
            results: insertResults,
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: error.message });
    }
};


export const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blogData = req.body;
        await BlogModel.updateBlog(id, blogData);
        res.json({ message: 'Blog updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        await BlogModel.deleteBlog(id);
        res.json({ message: 'Blog deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await BlogModel.getAllBlogs();
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await BlogModel.getBlogById(id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json(blog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getBlogByTitle = async (req, res) => {
    try {
        const { title } = req.params;
        const blog = await BlogModel.getBlogByTitle(title);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        res.json(blog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
