const mongoose = require('mongoose');

const documentRequestSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    documentType: {
      type: String,
      enum: ['Bonafide', 'LOR', 'NOC', 'No Dues', 'Fee Structure'],
      required: true
    },
    details: { type: String, required: true },
    assignedToRole: {
      type: String,
      enum: ['hod', 'registrar', 'finance'],
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    comments: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DocumentRequest', documentRequestSchema);
