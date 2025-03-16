import { getAllComments, addComments } from "../models/commentModel.js";

const getComments = async (req, res) => {
    try {
        const comments = await getAllComments(req.params.postId);
        res.json(comments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const addComment = async (req, res) => {
    console.log("Received Data:", req.body); // Debugging Line

    const { slug, name, comment } = req.body;

    if (!slug || !name || !comment) {
        console.error("Validation Error: Missing required fields");
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const response = await addComments(slug, name, comment);
        res.status(201).json(response);
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export { getComments, addComment };
