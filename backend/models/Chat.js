const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    donation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donation',
        required: true
    },
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ngo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastMessage: {
        text: String,
        timestamp: Date
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound index to ensure unique chat per donation/pair
chatSchema.index({ donation: 1, donor: 1, ngo: 1 }, { unique: true });

module.exports = mongoose.model('Chat', chatSchema);
