const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Get all users
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/users - Fetching all users');
    
    // Check if MongoDB is connected
    if (!User.db.readyState) {
      console.error('MongoDB not connected. Ready state:', User.db.readyState);
      return res.status(500).json({ message: 'Database connection error' });
    }

    // First, just count the users
    const userCount = await User.countDocuments();
    console.log('Total user count:', userCount);

    // Then try to fetch them with populated hospital
    const users = await User.find()
      .select('-password')
      .populate('hospital', 'name')
      .sort({ createdAt: -1 });

    console.log(`Successfully fetched ${users.length} users`);
    if (users.length > 0) {
      console.log('Sample user:', {
        ...users[0].toObject(),
        password: undefined
      });
    }

    res.json(users);
  } catch (err) {
    console.error('Error in GET /api/users:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Get single user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create user
router.post('/', async (req, res) => {
  const user = new User(req.body);
  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update user
router.patch('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 