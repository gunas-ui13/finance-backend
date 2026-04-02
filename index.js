const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

// Import our new Auth Routes
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const dashboardRoutes = require('./routes/dashboard');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// Tell the app to use the auth routes for any request starting with /api/auth
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
  res.send('Finance Backend is running!');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});