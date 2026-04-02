const express = require('express');
const Transaction = require('../models/Transaction');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// --- GET Dashboard Summary ---
// Only Admins and Analysts can view the summary (Viewers are blocked!)
router.get('/summary', verifyToken, requireRole(['Admin', 'Analyst']), async (req, res) => {
  try {
    // 1. Calculate Total Income and Expenses
    // Aggregation is like a pipeline. We pass all transactions in, and group them by "type".
    const totals = await Transaction.aggregate([
      {
        $group: {
          _id: '$type', // Group by 'Income' or 'Expense'
          totalAmount: { $sum: '$amount' } // Add up the 'amount' fields
        }
      }
    ]);

    // Format the totals into clean variables
    let totalIncome = 0;
    let totalExpense = 0;

    totals.forEach((item) => {
      if (item._id === 'Income') totalIncome = item.totalAmount;
      if (item._id === 'Expense') totalExpense = item.totalAmount;
    });

    const netBalance = totalIncome - totalExpense;

    // 2. Calculate Category-wise Totals
    const categoryTotals = await Transaction.aggregate([
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } } // Sort from highest amount to lowest
    ]);

    // 3. Send back one clean JSON object with everything the frontend needs
    res.status(200).json({
      overview: {
        totalIncome,
        totalExpense,
        netBalance
      },
      categoryBreakdown: categoryTotals
    });

  } catch (error) {
    res.status(500).json({ message: 'Error generating dashboard summary', error: error.message });
  }
});

module.exports = router;