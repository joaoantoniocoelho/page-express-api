const express = require('express');
const Template = require('../models/Template');
const logger = require('../utils/logger'); // Importação do logger configurado
const router = express.Router();

// Get all templates
router.get('/', async (req, res) => {
    try {
        const templates = await Template.find();
        logger.info(`Retrieved ${templates.length} templates`);
        res.json(templates);
    } catch (err) {
        logger.error(`Error retrieving templates: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get template by id
router.get('/:id', async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);

        if (!template) {
            logger.warn(`Template not found with id: ${req.params.id}`);
            return res.status(404).json({ message: 'Template not found' });
        }

        logger.info(`Template retrieved successfully with id: ${req.params.id}`);
        res.json(template);
    } catch (err) {
        logger.error(`Error retrieving template with id ${req.params.id}: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
