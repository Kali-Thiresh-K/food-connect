const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    foodName: {
        type: String,
        required: true
    },
    foodType: {
        type: String,
        enum: ['veg', 'non_veg'],
        required: true
    },
    quantity: {
        type: String,
        required: true
    },
    description: String,
    location: {
        type: String,
        required: true
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    availableFrom: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    },
    imageUrl: String,
    status: {
        type: String,
        enum: ['available', 'requested', 'accepted', 'collected', 'expired'],
        default: 'available'
    },
    status: {
        type: String,
        enum: ['available', 'requested', 'accepted', 'collected', 'expired'],
        default: 'available'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('Donation', donationSchema);
