const express = require('express');
const Transaction = require('../models/Transaction');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// --- 1. CREATE a transaction ---
// Only Admins can do this. Notice how we use our two middleware guards!
router.post('/', verifyToken, requireRole(['Admin']), async (req, res) => {
  try {
    // We automatically assign the 'createdBy' field using the ID from their JWT token
    const newTransaction = new Transaction({
      ...req.body,
      createdBy: req.user.userId 
    });
    
    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    // If they send a string instead of a number for amount, Mongoose catches it here
    res.status(400).json({ message: 'Error creating transaction', error: error.message });
  }
});

// --- 2. GET all transactions ---
// Anyone with a valid token (Viewer, Analyst, Admin) can view records
router.get('/', verifyToken, async (req, res) => {
  try {
    // This allows the frontend to filter! e.g., /api/transactions?type=Income
    const { type, category } = req.query; 
    let filter = {};
    
    if (type) filter.type = type;
    if (category) filter.category = category;

    // Fetch records matching the filter, sorted by newest date first
    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
});

// --- 3. UPDATE a transaction ---
// Admin only
router.put('/:id', verifyToken, requireRole(['Admin']), async (req, res) => {
  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true } // Return updated data, enforce schema rules
    );
    
    if (!updatedTransaction) return res.status(404).json({ message: 'Transaction not found' });
    
    res.status(200).json(updatedTransaction);
  } catch (error) {
    res.status(400).json({ message: 'Error updating transaction', error: error.message });
  }
});

// --- 4. DELETE a transaction ---
// Admin only
router.delete('/:id', verifyToken, requireRole(['Admin']), async (req, res) => {
  try {
    const deletedTransaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!deletedTransaction) return res.status(404).json({ message: 'Transaction not found' });
    
    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transaction', error: error.message });
  }
});

module.exports = router;