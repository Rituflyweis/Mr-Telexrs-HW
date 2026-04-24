const mongoose = require('mongoose');
const intakeFormSchema = new mongoose.Schema(
  {
    intakeFormId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IntakeForm',
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model('IntakeFormNotes', intakeFormSchema);

