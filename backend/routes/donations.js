const express = require('express');
const mongoose = require('mongoose');
const Donation = require('../models/Donation');
const auth = require('../middleware/auth');
const router = express.Router();

// Create Donation
router.post('/', auth, async (req, res) => {
    try {
        const { foodName, foodType, quantity, description, location, expiresAt, imageUrl } = req.body;

        const newDonation = new Donation({
            donor: req.user.id,
            foodName,
            foodType,
            quantity,
            description,
            location,
            expiresAt,
            imageUrl
        });

        const donation = await newDonation.save();
        res.json(donation);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get All Available Donations
router.get('/', async (req, res) => {
    try {
        const donations = await Donation.find({
            status: 'available',
            expiresAt: { $gt: new Date() }
        })
            .populate('donor', 'fullName organizationName')
            .sort({ createdAt: -1 });
        res.json(donations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get My Donations (Donor)
router.get('/my-donations', auth, async (req, res) => {
    try {
        const donations = await Donation.find({ donor: req.user.id }).sort({ createdAt: -1 });
        res.json(donations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Single Donation
router.get('/:id', async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id).populate('donor', 'fullName organizationName phone');
        if (!donation) return res.status(404).json({ message: 'Donation not found' });
        res.json(donation);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update Donation
router.put('/:id', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const donation = await Donation.findById(req.params.id);

        if (!donation) return res.status(404).json({ message: 'Donation not found' });

        // Allow Donor or Admin to update. 
        // Also allow NGO (requester) to mark as collected if they have an accepted request?
        // Simpler for now: Check if user is donor or admin.
        // For 'collected', maybe we trust the token bearer if they are relevant?
        // Let's implement full check:
        // If status is 'collected', allow if user is the accepted requester.

        let isAuthorized = false;
        if (donation.donor.toString() === req.user.id || req.user.role === 'admin') {
            isAuthorized = true;
        } else if (status === 'collected') {
            // Check if this user has an accepted request for this donation
            const request = await mongoose.model('DonationRequest').findOne({
                donation: donation.id,
                requester: req.user.id,
                status: 'accepted'
            });
            if (request) isAuthorized = true;
        }

        if (!isAuthorized) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (status) donation.status = status;

        await donation.save();
        res.json(donation);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete Donation
router.delete('/:id', auth, async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);
        if (!donation) return res.status(404).json({ message: 'Donation not found' });

        // Check user
        if (donation.donor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await donation.deleteOne();
        res.json({ message: 'Donation removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
