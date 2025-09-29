const Comment = require('../models/Comment');
const Expense = require('../models/Expense');

// Add comment to an expense
const addComment = async (req, res) => {
  const { expenseId, content } = req.body;
  const { userId } = req.user;

  const expense = await Expense.findById(expenseId);
  if (!expense) {
    return res.status(404).json({ message: 'Expense not found' });
  }

  const newComment = new Comment({
    user: userId,
    expense: expenseId,
    content,
  });

  await newComment.save();
  res.status(201).json(newComment);
};

// Fetch all comments for an expense
const getComments = async (req, res) => {
  const { expenseId } = req.params;
  const comments = await Comment.find({ expense: expenseId }).populate('user', 'name');

  res.status(200).json(comments);
};

module.exports = { addComment, getComments };