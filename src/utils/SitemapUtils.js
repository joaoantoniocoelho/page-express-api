const Page = require('../models/Page');
const logger = require('../utils/logger'); // Importação do logger

let cachedSitemap = null;
let lastGenerated = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora de cache

async function generateSitemap() {
    try {
        const pages = await Page.find();
        const baseUrl = 'https://pageexpress.io';

        const sitemapContent = `
            <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            ${pages
                .map(
                    (page) => `
                <url>
                    <loc>${baseUrl}/${page.slug}</loc>
                    <lastmod>${new Date(page.updatedAt).toISOString()}</lastmod>
                </url>`
                )
                .join('')}
            </urlset>
        `;

        cachedSitemap = sitemapContent.trim();
        lastGenerated = Date.now();

        logger.info(`Sitemap generated successfully with ${pages.length} pages.`);
    } catch (error) {
        logger.error(`Error generating sitemap: ${error.message}`);
        throw new Error('Failed to generate sitemap');
    }
}

function getCachedSitemap() {
    if (cachedSitemap) {
        logger.debug('Serving sitemap from cache.');
    } else {
        logger.debug('Sitemap cache is empty.');
    }
    return {
        cachedSitemap,
        lastGenerated,
    };
}

module.exports = { generateSitemap, getCachedSitemap, CACHE_DURATION };
