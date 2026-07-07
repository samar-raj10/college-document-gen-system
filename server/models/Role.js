const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    key: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isSystem: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Role', roleSchema);
