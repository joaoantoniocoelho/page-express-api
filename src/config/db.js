const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('The database is connected.');
  } catch (error) {
    
    logger.error('Error connecting to the database: ', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
