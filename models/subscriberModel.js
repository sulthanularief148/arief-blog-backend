import pool from '../config/db.js'

const addSubscriber = async (email) => {
    try {
        const [existingSubscriber] = await pool.query("SELECT * FROM subscribers WHERE email = ?", [email]);

        if (existingSubscriber.length > 0) {
            return { success: false, message: "Email already subscribed" };
        }

        await pool.query("INSERT INTO subscribers (email) VALUES (?)", [email]);
        return { success: true, message: "Subscribed successfully!" };
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Database operation failed");
    }
};

const getSubscribers = async () => {
    try {
        const [subscribers] = await pool.query("SELECT email FROM subscribers");
        return subscribers.map((sub) => sub.email);
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Database operation failed");
    }
};

export { addSubscriber, getSubscribers };
