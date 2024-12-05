const express = require('express');
const Page = require('../models/Page');
const { protect } = require('../middleware/authMiddleware');
const { generateSitemap } = require('../utils/sitemapUtils');
const logger = require('../utils/logger');

const router = express.Router();

// Create a new page
router.post('/', protect, async (req, res) => {
    const { title, slug, meta, content, template } = req.body;

    try {
        const slugExists = await Page.findOne({ slug });
        if (slugExists) {
            logger.warn(`Attempt to create a page with an existing slug: ${slug}`);
            return res.status(400).json({ message: 'Slug already exists.' });
        }

        const page = await Page.create({
            title,
            slug,
            meta,
            content,
            template,
            createdBy: req.user.id,
        });

        await generateSitemap();
        logger.info(`Page created successfully: ${page._id} by user: ${req.user.id}`);

        res.status(201).json(page);
    } catch (error) {
        logger.error(`Error creating page for user ${req.user.id}: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

// Edit a page
router.put('/:id', protect, async (req, res) => {
    const { title, meta, content } = req.body;

    try {
        const page = await Page.findById(req.params.id);

        if (!page) {
            logger.warn(`Attempt to edit non-existent page: ${req.params.id}`);
            return res.status(404).json({ message: 'Page not found.' });
        }

        if (page.createdBy.toString() !== req.user.id) {
            logger.warn(`Unauthorized edit attempt on page ${page._id} by user ${req.user.id}`);
            return res.status(403).json({ message: 'Access denied.' });
        }

        page.title = title || page.title;
        page.meta = meta || page.meta;
        page.content = content || page.content;

        const updatedPage = await page.save();

        await generateSitemap();
        logger.info(`Page updated successfully: ${updatedPage._id} by user: ${req.user.id}`);

        res.json(updatedPage);
    } catch (error) {
        logger.error(`Error updating page ${req.params.id} by user ${req.user.id}: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a page
router.delete('/:id', protect, async (req, res) => {
    try {
        const page = await Page.findById(req.params.id);

        if (!page) {
            logger.warn(`Attempt to delete non-existent page: ${req.params.id}`);
            return res.status(404).json({ message: 'Page not found.' });
        }

        if (page.createdBy.toString() !== req.user.id) {
            logger.warn(`Unauthorized delete attempt on page ${page._id} by user ${req.user.id}`);
            return res.status(403).json({ message: 'Access denied.' });
        }

        await page.deleteOne();

        await generateSitemap();
        logger.info(`Page deleted successfully: ${req.params.id} by user: ${req.user.id}`);

        res.json({ message: 'Page deleted.' });
    } catch (error) {
        logger.error(`Error deleting page ${req.params.id} by user ${req.user.id}: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get page by slug
router.get('/:slug', async (req, res) => {
    const { slug } = req.params;

    try {
        const page = await Page.findOne({ slug }).populate('template');

        if (!page) {
            logger.warn(`Page not found with slug: ${slug}`);
            return res.status(404).json({ message: 'Page not found.' });
        }

        logger.info(`Page retrieved successfully with slug: ${slug}`);
        res.json(page);
    } catch (error) {
        logger.error(`Error retrieving page with slug ${slug}: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
