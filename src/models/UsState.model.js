const mongoose = require('mongoose');

const usStateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 2 },
    isAvailable: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('UsState', usStateSchema);
