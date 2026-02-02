const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String, // Will store hashed password
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    phone: String,
    organizationName: String,
    address: String,
    role: {
        type: String,
        enum: ['donor', 'ngo', 'admin'],
        default: 'donor'
    },
    isApproved: {
        type: Boolean,
        default: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// userSchema.pre('save', function (next) {
//     this.updatedAt = Date.now();
//     next();
// });

module.exports = mongoose.model('User', userSchema);
