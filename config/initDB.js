import pool from './db.js';  // Your database connection
import dotenv from 'dotenv';

dotenv.config();

const createTables = async () => {
    const connection = await pool.getConnection();

    try {
        console.log("Checking and Creating Tables if not exists...");

        // Example Blog Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS blogs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                content LONGTEXT NOT NULL,
                images JSON,
                author VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        console.log("Blog table is ready ✅");

        // Optional - Admin Credentials Table (if you want DB-based admin system)
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
