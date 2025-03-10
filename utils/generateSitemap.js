import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogs = [
    { slug: 'why-react-is-the-most-popular-framework-in-2025', lastmod: '2025-03-09' },
    { slug: 'best-practices-for-react-performance', lastmod: '2025-02-20' }
];

const generateSitemap = () => {
    const urls = blogs.map(blog => `
    <url>
      <loc>https://arief.info/blogs/slug/${blog.slug}</loc>
      <lastmod>${blog.lastmod}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>
  `);
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://arief.info/</loc>
      <lastmod>2025-03-09</lastmod>
      <changefreq>weekly</changefreq>
      <priority>1.0</priority>
    </url>
    ${urls.join('\n')}
  </urlset>`;

    const filePath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    fs.writeFileSync(filePath, sitemap.trim());

    console.log(`✅ Sitemap successfully generated at ${filePath}`);
};

export default generateSitemap;
