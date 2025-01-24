'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const process = require('process');
require('dotenv').config(); // Load environment variables

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(path.resolve(__dirname, '../config/config.js'))[env];
const db = {};

let sequelize;

try {
  if (config.use_env_variable) {
    // Use DATABASE_URL from environment variable with SSL options
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true, // Enforce SSL connection
          rejectUnauthorized: false, // Disable certificate validation (use with caution)
        },
      },
      logging: false, // Disable logging for cleaner output
    });
  } else {
    // Use configuration from config file with SSL options
    sequelize = new Sequelize(config.database, config.username, config.password, {
      host: config.host,
      dialect: 'postgres',
      port: config.port,
      dialectOptions: {
        ssl: {
          require: true, // Enforce SSL connection
          rejectUnauthorized: false, // Disable certificate validation (use with caution)
        },
      },
      logging: false, // Disable logging for cleaner output
    });
  }

  // Load all model files in the current directory
  fs.readdirSync(__dirname)
    .filter((file) => {
      return (
        file.indexOf('.') !== 0 &&
        file !== basename &&
        file.slice(-3) === '.js' &&
        file.indexOf('.test.js') === -1
      );
    })
    .forEach((file) => {
      const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
    });

  // Set up associations
  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  console.log('✅ Sequelize initialized successfully.');
} catch (error) {
  console.error('❌ Error initializing Sequelize:', error);
  process.exit(1); // Exit if the database connection fails
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;