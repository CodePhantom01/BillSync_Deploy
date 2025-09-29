const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Import Routes
const groupRoutes = require('./routes/groupRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const authRoutes = require('./routes/authRoutes');
const commentRoutes = require('./routes/commentRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const invitationRoutes = require('./routes/invitationRoutes');
// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express App
const app = express();

// Allow requests from frontend origin
app.use(cors({
  origin: 'https://billsync-phi.vercel.app',
  //origin: 'http://localhost:3000', // Replace with your frontend's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true, // Include credentials (if needed)
}));

// Middleware to parse JSON data
app.use(express.json());

// Routes
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/invitations', invitationRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Define the Port and Start the Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
