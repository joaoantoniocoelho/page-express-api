const express = require('express');
const Page = require('../models/Page');
const { protect } = require('../middleware/authMiddleware');
const { generateSitemap } = require('../utils/sitemapUtils');
const router = express.Router();

// Create a new page
router.post('/', protect, async (req, res) => {
    const { title, slug, meta, content, template } = req.body;

    const slugExists = await Page.findOne({ slug });
    if (slugExists) {
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

    res.status(201).json(page);
});

// Edit a page
router.put('/:id', protect, async (req, res) => {
    const { title, meta, content } = req.body;
    const page = await Page.findById(req.params.id);
  
    if (!page) {
      return res.status(404).json({ message: 'Page not found.' });
    }
  
    if (page.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }
  
    page.title = title || page.title;
    page.meta = meta || page.meta;
    page.content = content || page.content;
  
    const updatedPage = await page.save();
  
    await generateSitemap();
  
    res.json(updatedPage);
});

// Delete a page
router.delete('/:id', protect, async (req, res) => {
    const page = await Page.findById(req.params.id);
  
    if (!page) {
      return res.status(404).json({ message: 'Page not found.' });
    }
  
    if (page.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }
  
    await page.deleteOne();
  
    // Atualiza o cache do sitemap
    await generateSitemap();
  
    res.json({ message: 'Page deleted.' });
});

// Get page by slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  const page = await Page.findOne({ slug }).populate('template');

  if (!page) {
    return res.status(404).json({ message: 'Page not found.' });
  }

  res.json(page);
});

module.exports = router;
