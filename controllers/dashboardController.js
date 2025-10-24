import pool from "../config/db.js";

// Increment blog views
export const recordView = async (req, res) => {
    const { id } = req.params;
    const { userId, country } = req.body;

    try {
        await pool.query(
            "INSERT INTO blog_metrics (blog_id, user_id, country, views) VALUES (?, ?, ?, 1) ON DUPLICATE KEY UPDATE views = views + 1",
            [id, userId || null, country || null]
        );
        res.json({ message: "View recorded" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Increment blog clicks
export const recordClick = async (req, res) => {
    const { id } = req.params;
    const { userId, country } = req.body;

    try {
        await pool.query(
            "INSERT INTO blog_metrics (blog_id, user_id, country, clicks) VALUES (?, ?, ?, 1) ON DUPLICATE KEY UPDATE clicks = clicks + 1",
            [id, userId || null, country || null]
        );
        res.json({ message: "Click recorded" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getDashboardMetrics = async (req, res) => {
    try {
        // Verify admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        // Rate limiting check
        const cacheKey = `metrics_${req.user.id}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
            return res.json(JSON.parse(cached));
        }

        // Secure aggregated queries only
        const metrics = await getAggregatedMetrics();

        // Cache for 5 minutes
        await redis.setex(cacheKey, 300, JSON.stringify(metrics));

        res.json(metrics);
    } catch (err) {
        logger.error('Dashboard metrics error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
