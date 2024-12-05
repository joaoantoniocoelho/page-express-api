const express = require('express');
const { generateSitemap, getCachedSitemap, CACHE_DURATION } = require('../utils/sitemapUtils');
const logger = require('../utils/logger'); // Importação do logger

const router = express.Router();

router.get('/sitemap.xml', async (req, res) => {
    const { cachedSitemap, lastGenerated } = getCachedSitemap();

    if (!cachedSitemap || Date.now() - lastGenerated > CACHE_DURATION) {
        logger.info('Sitemap cache expired or empty. Regenerating sitemap.');
        await generateSitemap();
    } else {
        logger.info('Serving sitemap from cache.');
    }

    res.header('Content-Type', 'application/xml');
    res.send(getCachedSitemap().cachedSitemap);
});

router.get('/robots.txt', (req, res) => {
    logger.info('Serving robots.txt');
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
