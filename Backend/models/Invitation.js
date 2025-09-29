const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema({
  groupId: { type: String , required: true},
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['ACTIVE', 'EXPIRED'],
    default: 'ACTIVE'
  },
  link: { type: String }
});

module.exports = mongoose.model("Invitation", invitationSchema);
