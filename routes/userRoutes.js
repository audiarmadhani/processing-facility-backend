const express = require('express');
const bcrypt = require('bcrypt'); // For password hashing
const router = express.Router();
const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust to your DB config

// Route for user registration
router.post('/register', async (req, res) => {
  const { email, password, name, role } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await sequelize.query(
      `SELECT * FROM "Users" WHERE "email" = :email`,
      { replacements: { email }, type: QueryTypes.SELECT }
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user
    await sequelize.query(
      `INSERT INTO "Users" ("email", "password", "name", "role", "createdAt", "updatedAt")
       VALUES (:email, :hashedPassword, :name, :role, NOW(), NOW())`,
      {
        replacements: { email, hashedPassword, name, role },
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Route for user login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fetch the user with the given email
    const user = await sequelize.query(
      `SELECT "id", "email", "password", "role" FROM "Users" WHERE "email" = :email`,
      { replacements: { email }, type: QueryTypes.SELECT }
    );

    if (user.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Return user information (excluding password)
    res.status(200).json({
      message: 'Login successful',
      user: { id: user[0].id, email: user[0].email, role: user[0].role },
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Route for fetching all users
router.get('/', async (req, res) => {
  try {
    const users = await sequelize.query(
      `SELECT "id", "email", "name", "role", "createdAt", "updatedAt" FROM "Users"`,
      { type: QueryTypes.SELECT }
    );

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});

module.exports = router;