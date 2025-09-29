const Transaction = require("../models/Transaction");
const Expense = require("../models/Expense");
const Group = require("../models/Group");
const User = require("../models/User");

// Settle Up Group Expenses
const addTransaction = async (req, res) => {
  const { groupId, fromUserId, toUserId, amount } = req.body; // `userId` is the payer's ID from req.user

  try {
    // Verify group existence
    const group = await Group.findById(groupId).populate("users");
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Check if both users belong to the group
    if (!group.users.some(user => user._id.toString() === fromUserId) || 
        !group.users.some(user => user._id.toString() === toUserId)) {
      return res.status(403).json({ message: "Users not part of this group" });
    }

    const transaction = new Transaction({
      fromUser: amount > 0 ? fromUserId : toUserId,
      toUser: amount > 0 ? toUserId : fromUserId,
      group : groupId,
      amount: Math.abs(amount),
    });

    await transaction.save();

    res.status(201).json({
      message: "Transaction recorded successfully",
      transaction,
    });
  } catch (error) {
    console.error("Error settling expenses:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addTransaction };
