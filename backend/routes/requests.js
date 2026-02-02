const express = require('express');
const DonationRequest = require('../models/DonationRequest');
const Donation = require('../models/Donation');
const Notification = require('../models/Notification');
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');
const router = express.Router();

// Create Request
router.post('/', auth, async (req, res) => {
    try {
        const { donationId, message } = req.body;

        const donation = await Donation.findById(donationId);
        if (!donation) return res.status(404).json({ message: 'Donation not found' });

        if (donation.status !== 'available') {
            return res.status(400).json({ message: 'Donation not available' });
        }

        // Check if already requested
        const existingRequest = await DonationRequest.findOne({ donation: donationId, requester: req.user.id });
        if (existingRequest) {
            return res.status(400).json({ message: 'Request already sent' });
        }

        const newRequest = new DonationRequest({
            donation: donationId,
            requester: req.user.id,
            message
        });

        await newRequest.save();

        // Update Donation Status
        donation.status = 'requested';
        await donation.save();

        // Notify Donor
        const notification = new Notification({
            user: donation.donor,
            title: 'New Donation Request',
            message: `Someone requested your ${donation.foodName}.`,
            type: 'request',
            relatedDonation: donation.id
        });
        await notification.save();

        res.json(newRequest);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get My Requests (NGO)
router.get('/my-requests', auth, async (req, res) => {
    try {
        const requests = await DonationRequest.find({ requester: req.user.id })
            .populate({
                path: 'donation',
                populate: { path: 'donor', select: 'fullName organizationName email phone' }
            })
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Requests Received (Donor)
router.get('/received', auth, async (req, res) => {
    try {
        // Find donations by this user
        const donations = await Donation.find({ donor: req.user.id }).select('_id');
        const donationIds = donations.map(d => d._id);

        const requests = await DonationRequest.find({ donation: { $in: donationIds } })
            .populate('requester', 'fullName organizationName phone email')
            .populate('donation', 'foodName')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Requests for My Donation (Donor)
router.get('/donation/:donationId', auth, async (req, res) => {
    try {
        const requests = await DonationRequest.find({ donation: req.params.donationId })
            .populate('requester', 'fullName organizationName phone')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update Request Status (Accept/Reject)
router.put('/:id', auth, async (req, res) => {
    try {
        const { status } = req.body; // accepted or rejected
        const request = await DonationRequest.findById(req.params.id).populate('donation');

        if (!request) return res.status(404).json({ message: 'Request not found' });

        // Verify donor ownership
        if (request.donation.donor.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        request.status = status;
        await request.save();

        if (status === 'accepted') {
            request.donation.status = 'accepted';
            await request.donation.save();

            // Notify Requester
            const notification = new Notification({
                user: request.requester,
                title: 'Request Accepted',
                message: `Your request for ${request.donation.foodName} has been accepted!`,
                type: 'accepted',
                relatedDonation: request.donation.id
            });
            await notification.save();

            // Create Chat for this pair
            // Check if one exists first (technically shouldn't if unique index holds and we didn't double accept)
            let chat = await Chat.findOne({
                donation: request.donation.id,
                donor: request.donation.donor,
                ngo: request.requester
            });

            if (!chat) {
                chat = new Chat({
                    donation: request.donation.id,
                    donor: request.donation.donor,
                    ngo: request.requester
                });
                await chat.save();
                console.log('✅ Chat created for Donation:', request.donation.id);
            }
        }

        res.json(request);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
