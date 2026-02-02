const mongoose = require('mongoose');

const donationRequestSchema = new mongoose.Schema({
    donation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donation',
        required: true
    },
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    message: String
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

donationRequestSchema.index({ donation: 1, requester: 1 }, { unique: true });

module.exports = mongoose.model('DonationRequest', donationRequestSchema);
