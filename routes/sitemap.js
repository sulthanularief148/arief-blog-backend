import express from 'express'
import path from 'path'

const router = express.Router();

// Serve the generated sitemap
router.get('/sitemap.xml', (req, res) => {
  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  res.sendFile(sitemapPath);
});

export default router;
