import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pool from "./config/db.js";
import blogRoutes from "./routes/blogRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import createTables from "./config/initDB.js";
import generateBlogSitemap from "./utils/generateSitemap.js";
import path from "path";
import { fileURLToPath } from "url";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import askRoutes from "./routes/askRoutes.js";

dotenv.config();

// ESM workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Initialize database tables
createTables()
    .then(() => {
        console.log("Database Initialization Complete ✅");
    })
    .catch((err) => {
        console.error("Database Initialization Failed ❌", err);
    });

// Test route
app.get("/test", (req, res) => {
    res.json("API working");
    console.log("Successfully deployed 🚀");
});

// API routes
app.use("/api", blogRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/ask", askRoutes);

// Sitemap route
app.get("/sitemap-blog.xml", generateBlogSitemap);

// Test database connection
async function databaseConnection() {
    try {
        const connection = await pool.getConnection();
        console.log("DATABASE CONNECTED SUCCESSFULLY ✅");
        connection.release();
    } catch (error) {
        console.error("DATABASE CONNECTION FAILED ❌:", error.message);
    }
}
databaseConnection();

// ✅ Only listen locally (not on Vercel)
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`Server Running on port ${PORT}`);
    });
}

// ✅ Export Express app for Vercel
export default app;
