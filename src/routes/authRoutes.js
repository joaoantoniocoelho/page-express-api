const express = require('express');
const logger = require('../utils/logger');
const { protect } = require('../middleware/authMiddleware');
const { generateToken } = require('../config/jwt');
const { sendResetPasswordEmail, anonymizeEmail } = require('../utils/emailUtils');

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            logger.warn(`Registration attempt with existing email: ${anonymizeEmail(email)}`);
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email, password });

        logger.info(`User registered successfully: ${user._id}`);
        
        res.status(201).json({ _id: user._id, name: user.name, email: user.email });
    } catch (error) {
        logger.error(`Error during registration for email ${anonymizeEmail(email)}: ${error.message}`);
        
        res.status(500).json({ message: 'Server error' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            logger.info(`User logged in: ${user._id}`);
            res.json({
                token: generateToken(user._id),
            });
        } else {
            logger.warn(`Invalid login attempt for email: ${anonymizeEmail(email)}`);
            
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        logger.error(`Error during login for email ${anonymizeEmail(email)}: ${error.message}`);
        
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user profile
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        if (user) {
            logger.info(`User profile retrieved: ${req.user._id}`);
            
            res.json(user);
        } else {
            logger.warn(`User profile not found: ${req.user._id}`);
            
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        logger.error(`Error retrieving user profile: ${error.message}`);
        
        res.status(500).json({ message: 'Server error' });
    }
});

// Send reset password email
router.post('/reset-password-email', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            logger.warn(`Password reset attempt for non-existent email: ${anonymizeEmail(email)}`);
            return res.status(404).json({ message: 'User not found' });
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        await sendResetPasswordEmail(email, resetLink);

        logger.info(`Password reset email sent to: ${anonymizeEmail(email)}`);
        
        res.status(200).json({ message: 'Email sent' });
    } catch (error) {
        logger.error(`Error sending password reset email to ${anonymizeEmail(email)}: ${error.message}`);
        
        res.status(500).json({ message: 'Server error' });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);

        if (!user) {
            logger.warn(`Password reset attempt with invalid user ID: ${decoded._id}`);
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = newPassword;
        await user.save();

        logger.info(`Password successfully reset for user: ${user._id}`);
        
        res.status(200).json({ message: 'Password updated' });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            logger.warn(`Expired password reset token used`);
            res.status(401).json({ message: 'Token expired' });
        } else {
            logger.error(`Error resetting password: ${error.message}`);
            
            res.status(400).json({ message: 'Invalid Token' });
        }
    }
});

// Verify reset token
router.get('/verify-reset-token', async (req, res) => {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        logger.info(`Valid reset token for user: ${decoded._id}`);
        
        res.status(200).json({ valid: true, message: 'Valid Token.', userId: decoded._id });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            logger.warn(`Expired reset token verification attempt`);
            
            res.status(401).json({ valid: false, message: 'Token expired.' });
        } else {
            logger.error(`Invalid reset token verification attempt: ${error.message}`);
            
            res.status(400).json({ valid: false, message: 'Invalid Token.' });
        }
    }
});

module.exports = router;

