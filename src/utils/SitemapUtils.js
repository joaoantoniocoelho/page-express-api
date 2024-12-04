const Page = require('../models/Page');

let cachedSitemap = null;
let lastGenerated = null;
const CACHE_DURATION = 60 * 60 * 1000;

async function generateSitemap() {
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
}

function getCachedSitemap() {
    return {
        cachedSitemap,
        lastGenerated,
    };
}

module.exports = { generateSitemap, getCachedSitemap, CACHE_DURATION };
