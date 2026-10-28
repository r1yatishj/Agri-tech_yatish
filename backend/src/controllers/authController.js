const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const mockStore = require('../utils/mockStore');

const isDBConnected = () => mongoose.connection.readyState === 1;

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      language: user.language || 'en',
    },
    process.env.JWT_SECRET || 'agritech_jwt_secure_secret_token_key_2026',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user (farmer or admin)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, language, phone, location } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    const assignedRole = role === 'admin' ? 'admin' : 'farmer';

    if (isDBConnected()) {
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists',
        });
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: assignedRole,
        language: language || 'en',
        phone: phone || '',
        location: location || '',
      });

      const token = generateToken(user);

      return res.status(201).json({
        success: true,
        message: 'Registration successful! Welcome to Agri-Tech.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          language: user.language,
          phone: user.phone,
          location: user.location,
        },
      });
    } else {
      // In-Memory fallback
      const existing = mockStore.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists',
        });
      }

      const newUser = {
        _id: 'user_' + Date.now(),
        name,
        email: email.toLowerCase(),
        passwordHash: bcrypt.hashSync(password, 10),
        role: assignedRole,
        language: language || 'en',
        phone: phone || '',
        location: location || '',
        createdAt: new Date(),
      };

      mockStore.users.push(newUser);
      const token = generateToken(newUser);

      return res.status(201).json({
        success: true,
        message: 'Registration successful! Welcome to Agri-Tech.',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          language: newUser.language,
          phone: newUser.phone,
          location: newUser.location,
        },
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error occurred during registration',
    });
  }
};

// @desc    Authenticate user & get JWT token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    if (isDBConnected()) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const token = generateToken(user);

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          language: user.language,
          phone: user.phone,
          location: user.location,
        },
      });
    } else {
      // In-Memory fallback
      const user = mockStore.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const isMatch = bcrypt.compareSync(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const token = generateToken(user);

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          language: user.language,
          phone: user.phone,
          location: user.location,
        },
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    return res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        language: req.user.language || 'en',
        phone: req.user.phone || '',
        location: req.user.location || '',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user profile',
    });
  }
};

// @desc    Update user profile / language preference
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, language, phone, location } = req.body;

    if (isDBConnected()) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (name) user.name = name;
      if (language) user.language = language;
      if (phone) user.phone = phone;
      if (location) user.location = location;

      await user.save();

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          language: user.language,
          phone: user.phone,
          location: user.location,
        },
      });
    } else {
      const user = mockStore.users.find(
        (u) => u._id.toString() === req.user._id.toString()
      );
      if (user) {
        if (name) user.name = name;
        if (language) user.language = language;
        if (phone) user.phone = phone;
        if (location) user.location = location;
      }

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: req.user._id,
          name: name || req.user.name,
          email: req.user.email,
          role: req.user.role,
          language: language || req.user.language,
          phone: phone || req.user.phone,
          location: location || req.user.location,
        },
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Profile update failed',
    });
  }
};
