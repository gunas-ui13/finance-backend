const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // No duplicate emails allowed
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Viewer', 'Analyst', 'Admin'], // Only these exact roles are allowed
    default: 'Viewer',
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt dates

module.exports = mongoose.model('User', userSchema);