require('dotenv').config(); // Load environment variables from .env file
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect((err) => {
  if (err) {
    console.error('Error connecting to the PostgreSQL database:', err.message);
  } else {
    console.log('Connected to the PostgreSQL database.');
  }
});

module.exports = pool;