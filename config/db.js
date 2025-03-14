import mysql from 'mysql2/promise'
import dotenv from 'dotenv';
dotenv.config();


const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    connectTimeout: 10000, // 10 seconds timeout
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


export default pool;

// srv1492.hstgr.io - hostname || 193.203.184.95
