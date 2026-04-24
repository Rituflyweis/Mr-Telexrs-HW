const mongoose = require('mongoose');

const intakeFormFieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
}, { timestamps: true });
// Index for ordering
intakeFormFieldSchema.index({ order: 1, isActive: 1 });
module.exports = mongoose.model('IntakeFormFieldSection', intakeFormFieldSchema);

