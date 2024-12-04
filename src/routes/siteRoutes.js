const express = require('express');
const { generateSitemap, getCachedSitemap, CACHE_DURATION } = require('../utils/sitemapUtils');

const router = express.Router();

// Servir o sitemap
router.get('/sitemap.xml', async (req, res) => {
    const { cachedSitemap, lastGenerated } = getCachedSitemap();

    if (!cachedSitemap || Date.now() - lastGenerated > CACHE_DURATION) {
        await generateSitemap();
    }

    res.header('Content-Type', 'application/xml');
    res.send(getCachedSitemap().cachedSitemap);
});

router.get('/robots.txt', (req, res) => {
    const robotsContent = `
        User-agent: *
        Disallow: /login
        Disallow: /dashboard
        Disallow: /api
        Allow: /

        Sitemap: https://pageexpress.io/sitemap.xml
    `;
    res.header('Content-Type', 'text/plain');
    res.send(robotsContent.trim());
});

module.exports = router;
