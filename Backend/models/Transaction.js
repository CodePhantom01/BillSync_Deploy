const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  description: { type: String },
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", transactionSchema);
