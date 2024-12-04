const express = require('express');
const Template = require('../models/Template');
const router = express.Router();

// Get all templates
router.get('/', async (req, res) => {
    try {
        const templates = await Template.find();
        res.json(templates);
    } catch (err) {
        res.json({ message: err });
    }
    }
);

// Get template by id
router.get('/:id', async (req, res) => {
    
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
  
    res.json(template);
});

module.exports = router;
