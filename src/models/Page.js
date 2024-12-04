const { meta } = require('eslint-plugin-prettier');
const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true },
    meta: {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        keywords: { type: [String], default: [] },
    },
    content: { type: Object, required: true },
    template: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Page', pageSchema);