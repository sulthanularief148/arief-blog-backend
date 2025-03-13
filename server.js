import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import pool from './config/db.js'
import blogRoutes from './routes/blogRoutes.js'
import adminRoutes from "./routes/adminRoutes.js"
import createTables from './config/initDB.js'
// import sitemapRoute from './routes/sitemap.js'
import path from 'path'
import { fileURLToPath } from 'url';
import generateSitemap from './utils/generateSitemap.js'
import newsletterRoutes from "./routes/newsletterRoutes.js";


dotenv.config();
// ESM workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
app.use(express.json());
app.use(cors())
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')));


createTables().then(() => {
    console.log("Database Initialization Complete ✅");
}).catch(err => {
    console.error("Database Initialization Failed ❌", err);
});

generateSitemap();
app.use('/', (req, res) => {
    return res.json("Hello world!")
})
// app.use('/', sitemapRoute);
app.use('/api', blogRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/newsletter", newsletterRoutes);

async function databaseConnection() {
    try {
        const connection = await pool.getConnection();
        console.log("DATABASE CONNECTED SUCCESSFULLY");
        connection.release();  // important to release the connection back to the pool
    } catch (error) {
        console.error("DATABASE CONNECTION FAILED:", error.message);
    }
}

databaseConnection()

app.listen(process.env.PORT, () => {
    console.log(`Server Running on port ${process.env.PORT}`);

})