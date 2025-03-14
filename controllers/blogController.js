import * as BlogModel from '../models/blogModel.js';
import slugify from "slugify";
import pool from "../config/db.js";
import  { sendBlogNotification } from '../utils/sendEmail.js';

export const addBlog = async (req, res) => {
    const blogs = Array.isArray(req.body) ? req.body : [req.body];

    try {
        const insertResults = [];
        let blogSlug = ""; // To store the latest blog slug for email

        for (const blog of blogs) {
            const { title, description, author, date, images, content, category } = blog;

            // ✅ Generate slug
            const slug = slugify(title, { lower: true, strict: true });

            // ✅ Insert blog into database
            const [result] = await pool.query(
                "INSERT INTO blogs (title, slug, description, author, date, images, content, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [title, slug, description, author, date, JSON.stringify(images), JSON.stringify(content), category]
            );

            // ✅ Fetch the inserted blog slug from the database
            const [blogData] = await pool.query(
                "SELECT slug FROM blogs WHERE id = ?",
                [result.insertId]
            );

            blogSlug = blogData[0]?.slug || slug; // Use DB slug or fallback to generated slug

            insertResults.push({
                message: "Blog created successfully",
                blogId: result.insertId,
                slug: blogSlug
            });
        }

        // ✅ Fetch all subscribers
        const [subscribers] = await pool.query("SELECT email FROM subscribers");
        const emails = subscribers.map(sub => sub.email);

        console.log("📩 Sending email to subscribers:", emails);

        if (emails.length > 0) {
            await sendBlogNotification(emails, blogs[0].title, blogs[0].description, blogSlug, blogs[0]?.images);
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
    const [rows] = await pool.query(
        "SELECT * FROM blogs WHERE slug = ?",
        [slug]
    );

    if (rows.length === 0) {
        return res.status(404).json({ message: "Blog not found" });
    }

    res.json(rows[0]);
};

// export const getBlogBySlug = async (slug) => {
//     const [rows] = await pool.query("SELECT * FROM blogs WHERE slug = ?", [slug]);

//     if (rows.length === 0) return null;

//     const blog = rows[0];
//     return {
//         ...blog,
//         images: safeParseJSON(blog.images, []),
//         details: safeParseJSON(blog.details, ""),
//         category: blog.category  // Added category
//     };
// };

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
    const { category } = req.query;

    try {
        let query = "SELECT * FROM blogs";
        const queryParams = [];

        if (category) {
            query += " WHERE category = ?";
            queryParams.push(category);
        }

        const [blogs] = await pool.query(query, queryParams);

        res.json(blogs.map(blog => ({
            ...blog,
            slug: blog.slug,
            images: JSON.parse(blog.images)
        })));
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
        const decodedTitle = decodeURIComponent(title);
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


