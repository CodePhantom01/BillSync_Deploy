const mongoose = require("mongoose");

const settlementSchema = new mongoose.Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'],
      default: 'PENDING'
    },
    fromUser: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true 
    },
    toUser: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true 
    },
    approvals: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      approved: { type: Boolean, default: false },
      approvedAt: { type: Date },
      comment: { type: String }
    }],
    comments: [{
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
    }]
}, { timestamps: true });

module.exports = mongoose.model("Settlement", settlementSchema); 