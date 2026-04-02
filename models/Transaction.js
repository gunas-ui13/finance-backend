const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0, // No negative numbers allowed
  },
  type: {
    type: String,
    enum: ['Income', 'Expense'], // Must be one of these two
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
  },
  // We link each transaction to the specific user who created it
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);