const express = require('express');
const Donation = require('../models/Donation');
const User = require('../models/User');
const router = express.Router();

// Get Public Stats
router.get('/', async (req, res) => {
    try {
        const totalDonations = await Donation.countDocuments();
        const collectedDonations = await Donation.countDocuments({ status: 'collected' });
        const activeDonors = await User.countDocuments({ role: 'donor' });
        const activeNGOs = await User.countDocuments({ role: 'ngo' });

        // Estimate people fed (10 people per donation roughly)
        const peopleFed = collectedDonations * 10;

        res.json({
            totalDonations,
            foodCollected: collectedDonations,
            activeDonors,
            activeNGOs,
            peopleFed
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
