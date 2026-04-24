const mongoose = require('mongoose');

const stateAvailabilitySchema = new mongoose.Schema({
    state: {
        type: String,
        required: true,
       // unique: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    available: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Create index for faster queries
stateAvailabilitySchema.index({ state: 1 });
stateAvailabilitySchema.index({ code: 1 });
stateAvailabilitySchema.index({ available: 1 });

module.exports = mongoose.model('StateAvailability', stateAvailabilitySchema);