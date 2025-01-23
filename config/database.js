const { Sequelize } = require('sequelize');
const path = require('path');
const config = require('./config'); // Import config.js (or config.json)

// Determine the environment (default to development)
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Ensure the database storage path is absolute
dbConfig.storage = path.resolve(__dirname, dbConfig.storage);

// Initialize Sequelize using the configuration
const sequelize = new Sequelize({
  dialect: dbConfig.dialect,
  storage: dbConfig.storage,
  logging: false, // Disable logging
});

module.exports = sequelize;