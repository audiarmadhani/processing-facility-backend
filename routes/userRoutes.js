const express = require('express');
const bcrypt = require('bcrypt'); // Add bcrypt for password hashing
const router = express.Router();
const sequelize = require('../config/database'); // Adjust the path if necessary
const { User } = require('../models'); // Adjust based on your models' structure

// Route for user registration
router.post('/register', async (req, res) => {
  const { email, password, name, role } = req.body; // Added role to the request body

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Create the user with the role included
    const user = await User.create({ 
      email, 
      password: hashedPassword, 
      name, 
      role, // Include role in user creation
      createdAt: new Date(), 
      updatedAt: new Date() 
    });

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Route for user login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Return user information (do not send the password)
    res.status(200).json({ 
      message: 'Login successful', 
      user: { id: user.id, email: user.email, role: user.role } // Include role in the response
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Route for fetching all users (optional)
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll(); // Fetch all users
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});

module.exports = router;