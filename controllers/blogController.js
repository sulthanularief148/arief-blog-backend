import * as BlogModel from '../models/blogModel.js';
import pool from '../config/db.js';
import slugify from 'slugify';
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

    try {
        const insertResults = [];

        for (const blog of blogs) {
            const { title, description, author, date, images, content } = blog;

            const slug = slugify(title, { lower: true, strict: true });
            console.log("Generated Slug:", slug);

            const [result] = await pool.query(
                "INSERT INTO blogs (title, slug, description, author, date, images, content) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [title, slug, description, author, date, JSON.stringify(images), JSON.stringify(content)]
            );

            insertResults.push({
                message: "Blog created successfully",
                blogId: result.insertId,
                slug
            });
        }

        res.status(201).json({
            message: "Blogs processed successfully",
            results: insertResults
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: error.message });
    }
};


export const getBlogBySlug = async (req, res) => {
    const { slug } = req.params;
    console.log(slug);

    const [rows] = await pool.query(
        "SELECT * FROM blogs WHERE slug = ?",
        [slug]
    );
    console.log([rows], "Rows");

    if (rows.length === 0) {
        return res.status(404).json({ message: "Blog not found" });
    }

    res.json(rows[0]);
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
        console.log(blogs, "blogs");

        return res.json(blogs);
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
        console.log("Received Title (Encoded):", title);  // Debug
        const decodedTitle = decodeURIComponent(title);
        console.log("Decoded Title:", decodedTitle);      // Debug

        const blog = await BlogModel.getBlogByTitle(decodedTitle);

        if (!blog) {
            console.log("Blog Not Found for Title:", decodedTitle);  // Debug
            return res.status(404).json({ message: 'Blog not found' });
        }

        res.json(blog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


