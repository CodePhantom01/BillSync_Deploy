const express = require('express');
const { createExpense, approveExpense, getExpenseById, deleteExpense, addComment, deleteComment } = require('../controllers/expenseController');

const router = express.Router();


const authMiddleware = require("../middlewares/authMiddleware");

router.post('/create', authMiddleware, createExpense);
router.post('/approve', authMiddleware, approveExpense);
router.get('/get/:expenseId', authMiddleware, getExpenseById);
router.delete('/delete/:expenseId', authMiddleware, deleteExpense);
router.post('/:expenseId/comments', authMiddleware, addComment);
router.delete('/:expenseId/comments/:commentId', authMiddleware, deleteComment);

module.exports = router;
