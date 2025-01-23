const path = require('path');

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '../coffee-processing.db'),
  },
  test: {
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '../coffee-processing.db'),
  },
  production: {
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '../coffee-processing.db'),
  },
}