const express = require('express');
const mongoose = require('mongoose');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Donation = require('../models/Donation');
const auth = require('../middleware/auth');
const router = express.Router();

const DonationRequest = require('../models/DonationRequest');

// Get (or implicitly validate access to) Chat for a Donation
// Logic: If I am the donor or the NGO of an accepted donation, return the chat.
router.get('/donation/:donationId', auth, async (req, res) => {
    try {
        const { donationId } = req.params;

        // Find existing chat
        let chat = await Chat.findOne({ donation: donationId })
            .populate('donor', 'fullName organizationName')
            .populate('ngo', 'fullName organizationName');

        // IF chat strictly doesn't exist, check if we SHOULD have one (migration/backfill)
        if (!chat) {
            // Find an accepted request for this donation involving the current user
            // The user could be the Donor (owner) or the NGO (requester)
            const donation = await Donation.findById(donationId);
            if (!donation) return res.status(404).json({ message: 'Donation not found' });

            const request = await DonationRequest.findOne({
                donation: donationId,
                status: 'accepted'
            });

            if (request) {
                // If the user is either the donor or the requester
                if (donation.donor.toString() === req.user.id || request.requester.toString() === req.user.id) {
                    // Create the missing chat
                    chat = new Chat({
                        donation: donationId,
                        donor: donation.donor,
                        ngo: request.requester
                    });
                    await chat.save();

                    // Re-fetch to populate
                    chat = await Chat.findById(chat.id)
                        .populate('donor', 'fullName organizationName')
                        .populate('ngo', 'fullName organizationName');
                }
            }
        }

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Verify Access
        if (chat.donor._id.toString() !== req.user.id && chat.ngo._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this chat' });
        }

        res.json(chat);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Messages for a Chat
router.get('/:chatId/messages', auth, async (req, res) => {
    try {
        const { chatId } = req.params;

        // Check chat access
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        if (chat.donor.toString() !== req.user.id && chat.ngo.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const messages = await Message.find({ chat: chatId })
            .populate('sender', 'fullName')
            .sort({ createdAt: 1 }); // Chronological

        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Send Message
router.post('/:chatId/messages', auth, async (req, res) => {
    try {
        const { chatId } = req.params;
        const { text } = req.body;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        // Verify Access
        if (chat.donor.toString() !== req.user.id && chat.ngo.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Check if chat is active (e.g. donation not expired) - Optional requirement but good practice
        if (!chat.isActive) {
            return res.status(400).json({ message: 'Chat is closed' });
        }

        const newMessage = new Message({
            chat: chatId,
            sender: req.user.id,
            text
        });

        await newMessage.save();

        // Update last message in Chat
        chat.lastMessage = {
            text,
            timestamp: newMessage.createdAt
        };
        await chat.save();

        // Return populated message
        await newMessage.populate('sender', 'fullName');

        res.json(newMessage);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Unread Counts
router.get('/unread-counts', auth, async (req, res) => {
    try {
        // Find all chats where user is participant
        const chats = await Chat.find({
            $or: [{ donor: req.user.id }, { ngo: req.user.id }]
        });

        const chatIds = chats.map(c => c._id);

        // Aggregate unread messages for these chats sent by NOT the current user
        const unreadCounts = await Message.aggregate([
            {
                $match: {
                    chat: { $in: chatIds },
                    sender: { $ne: new mongoose.Types.ObjectId(req.user.id) },
                    isRead: false
                }
            },
            {
                $group: {
                    _id: '$chat',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Convert to map for easier frontend consumption: { donationId: count }
        // We need to map chatId back to donationId
        const result = {};

        for (const countData of unreadCounts) {
            const chat = chats.find(c => c._id.toString() === countData._id.toString());
            if (chat) {
                // Explicitly convert to string to ensure matching with frontend
                result[chat.donation.toString()] = countData.count;
            }
        }

        res.json(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Mark messages as read
router.put('/:chatId/read', auth, async (req, res) => {
    try {
        const { chatId } = req.params;

        // Verify access
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        if (chat.donor.toString() !== req.user.id && chat.ngo.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Update all messages in this chat sent by OTHER user to isRead: true
        await Message.updateMany(
            {
                chat: chatId,
                sender: { $ne: req.user.id },
                isRead: false
            },
            { $set: { isRead: true } }
        );

        res.json({ success: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
