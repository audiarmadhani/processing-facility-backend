module.exports = {
  development: {
    use_env_variable: 'DATABASE_URL', // Use the DATABASE_URL environment variable for development
    dialect: 'postgres',
  },
  test: {
    use_env_variable: 'DATABASE_URL', // Use the DATABASE_URL environment variable for testing
    dialect: 'postgres',
  },
  production: {
    use_env_variable: 'DATABASE_URL', // Use the DATABASE_URL environment variable for production
    dialect: 'postgres',
  },
};