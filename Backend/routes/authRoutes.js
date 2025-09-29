const express = require('express');
const { 
    register,  
    login,
    getCurrentUser
} = require('../controllers/authController');

const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// User registration
router.post('/register', register);

// User login
router.post('/login', login);

// Get current user
router.get('/current-user', authMiddleware, getCurrentUser);

module.exports = router;
