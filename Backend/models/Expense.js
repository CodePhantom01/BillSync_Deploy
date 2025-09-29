const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema({
  text: { 
    type: String, 
    required: true,
    maxLength: 50 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  }
}, { timestamps: true });
// Expense Model
const expenseSchema = new mongoose.Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'DELETED'],
      default: 'PENDING'
    },
    category: {
      type: String,
      enum: ['FOOD', 'TRANSPORT', 'ENTERTAINMENT', 'SHOPPING', 'OTHERS'],
      required: true
    },
    paidBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true 
    },
    participants: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      share: { type: Number },
      approved: { type: Boolean, default: false },
      approvedAt: { type: Date }
    }],
    comments: {
      type: [commentSchema],
      validate: [
        {
          validator: function(comments) {
            return comments.length <= 50;
          },
          message: 'Maximum 50 comments allowed per expense'
        }
      ]
    }
}, { timestamps: true });
  
module.exports = mongoose.model("Expense", expenseSchema);