import db from "../config/db.js";

// Fetch all comments for a post (by slug)
const getAllComments = async (slug) => {
    try {
        // Convert slug to postId
        const [post] = await db.execute("SELECT id FROM blogs WHERE slug = ?", [slug]);
        if (post.length === 0) throw new Error("Post not found");

        const postId = post[0].id;
        const query = "SELECT * FROM comments WHERE postId = ? ORDER BY created_at DESC";
        const [comments] = await db.execute(query, [postId]);

        return comments;
    } catch (error) {
        console.error("Error fetching comments:", error);
        throw new Error("Failed to fetch comments. Please try again later.");
    }
};

// Add a new comment to a post (by slug)
const addComments = async (slug, name, comment) => {
    try {
        if (!slug || !name || !comment) {
            throw new Error("All fields are required");
        }

        // Convert slug to postId
        const [post] = await db.execute("SELECT id FROM blogs WHERE slug = ?", [slug]);
        if (post.length === 0) throw new Error("Post not found");

        const postId = post[0].id;
        const query = "INSERT INTO comments (postId, name, comment) VALUES (?, ?, ?)";
        await db.execute(query, [postId, name, comment]);

        return { message: "Comment added successfully!" };
    } catch (error) {
        console.error("Error adding comment:", error);
        throw new Error("Failed to add comment. Please try again.");
    }
};

export { getAllComments, addComments };
