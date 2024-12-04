const express = require('express');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());

// Rotas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/templates', require('./routes/templateRoutes'));
app.use('/api/pages', require('./routes/pageRoutes'));
app.use('/', require('./routes/siteRoutes'));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
