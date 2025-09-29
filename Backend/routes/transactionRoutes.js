const express = require('express');
const { addTransaction } = require('../controllers/transactionController');

const router = express.Router();


const authMiddleware = require("../middlewares/authMiddleware");

router.post('/add', authMiddleware, addTransaction);

module.exports = router;
