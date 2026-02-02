const express = require('express');
const User = require('../models/User');
const Donation = require('../models/Donation');
const auth = require('../middleware/auth');
const router = express.Router();

// Middleware to check if user is admin
const adminAuth = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Get All Users
router.get('/users', auth, adminAuth, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Block/Unblock User
router.put('/users/:id/block', auth, adminAuth, async (req, res) => {
    try {
        const { isBlocked } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isBlocked: isBlocked },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
