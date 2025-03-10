import pool from './db.js';  // Your database connection
import dotenv from 'dotenv';

dotenv.config();

const createTables = async () => {
    const connection = await pool.getConnection();

    try {
        console.log("Checking and Creating Tables if not exists...");

        // Enhanced Blog Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS blogs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(200) NOT NULL UNIQUE,
                description TEXT NOT NULL,
                content LONGTEXT NOT NULL,
                images JSON,
                author VARCHAR(100) NOT NULL,
                category VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        console.log("Blog table is ready ✅");

        // Improved Admin Credentials Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS admin_users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("Admin Users table is ready ✅");

    } catch (err) {
        console.error("Error creating tables:", err.message);
    } finally {
        connection.release();
    }
};

export default createTables;
