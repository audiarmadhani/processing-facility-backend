'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(path.resolve(__dirname, '../config/config.js'))[env];
const db = {};

let sequelize;

try {
  if (config.use_env_variable) {
    // Use environment variable for database connection
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
  } else {
    // Resolve the storage path to an absolute path
    if (config.storage) {
      config.storage = path.resolve(__dirname, '../', config.storage);
    }

    sequelize = new Sequelize(config);
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
} catch (error) {
  console.error('Error initializing Sequelize:', error);
  process.exit(1); // Exit if the database connection fails
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;