import pool from "../config/db.js";

export default async function generateBlogSitemap(req, res) {
  try {
    const [blogs] = await pool.query("SELECT slug, updatedAt FROM blogs");

    const urls = blogs
      .map(
        (blog) => `
        <url>
          <loc>https://arief.info/blogs/slug/${blog.slug}</loc>
          <lastmod>${new Date(blog.updatedAt).toISOString()}</lastmod>
          <changefreq>monthly</changefreq>
          <priority>0.8</priority>
        </url>
      `
      )
      .join("");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls}
    </urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(sitemap);
  } catch (error) {
    console.error("❌ Error generating blog sitemap:", error);
    res.status(500).send("Failed to generate blog sitemap");
  }
}
