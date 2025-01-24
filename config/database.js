const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file

// Determine the environment (default to development)
const env = process.env.NODE_ENV || 'development';

// Use environment variable for PostgreSQL connection
const isUsingEnvVariable = env === 'development' || env === 'production';

let sequelize;

if (isUsingEnvVariable) {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('❌ DATABASE_URL environment variable is not set!');
  }

  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false, // Disable logging
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Necessary for hosted PostgreSQL (e.g., Supabase)
      },
    },
  });
} else {
  throw new Error(`❌ Unsupported environment: ${env}`);
}

module.exports = sequelize;