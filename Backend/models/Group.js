const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Expense" }],
  settlements: [{ type: mongoose.Schema.Types.ObjectId, ref: "Settlement" }],
  status: {
    type: String,
    enum: ['ACTIVE', 'ARCHIVED'],
    default: 'ACTIVE'
  },
  settings: {
    requireApproval: { type: Boolean, default: true },
    allowComments: { type: Boolean, default: true },
    defaultCurrency: { type: String, default: 'USD' }
  }
}, { timestamps: true });

module.exports = mongoose.model("Group", groupSchema);