const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    type: { type: String, required: true },
    editable: { type: Boolean, required: true },
    defaultContent: { type: String, required: true },
});

const templateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    sections: [sectionSchema],
    styles: {
        primaryColor: { type: String, default: '#1d4ed8' },
        secondaryColor: { type: String, default: '#f9fafb' },
        fontFamily: { type: String, default: 'Arial, sans-serif' },
    }
});

module.exports = mongoose.model('Template', templateSchema);