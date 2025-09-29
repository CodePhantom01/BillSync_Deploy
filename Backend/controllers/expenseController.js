const Expense = require("../models/Expense");
const Group = require("../models/Group");
const User = require("../models/User");
// const nodemailer = require("nodemailer");
// const twilio = require("twilio");

// const sendNotification = (expense, users, message) => {
//   // Send email notification
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'your-email@gmail.com', // Replace with your email
//       pass: 'your-email-password',   // Replace with your email password
//     },
//   });

//   users.forEach(user => {
//     const mailOptions = {
//       from: 'your-email@gmail.com',
//       to: user.email,
//       subject: `New Expense Added: ${expense.description}`,
//       text: message,
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.log("Error sending email: ", error);
//       } else {
//         console.log("Email sent: " + info.response);
//       }
//     });
//   });

//   // Send WhatsApp notification (Twilio example)
//   const client = twilio('your-account-sid', 'your-auth-token');
  
//   users.forEach(user => {
//     client.messages.create({
//       body: message,
//       from: 'whatsapp:+1415XXXXXXX',  // Your Twilio WhatsApp number
//       to: `whatsapp:${user.phoneNumber}`,
//     }).then(message => console.log(message.sid));
//   });
// };

const createExpense = async (req, res) => {
  try {
    const { groupId, description, amount, category, splitType, participants, paidBy } = req.body;
    const { userId } = req.user;

    // Validate group existence and membership
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (!group.users.includes(userId)) {
      return res.status(403).json({ message: "User not in group" });
    }

    if (!group.users.includes(paidBy)) {
      return res.status(400).json({ message: "Paid by user must be a group member" });
    }

    // Validate total shares equal to amount for EXACT split
    const totalShares = participants.reduce((sum, p) => sum + p.share, 0);
      if (totalShares !== amount) {
        return res.status(400).json({ message: "Total shares must equal amount" });
      }

    const expense = new Expense({
      description,
      amount,
      category,
      group: groupId,
      createdBy: userId,
      paidBy: paidBy,
      participants: participants.map(p => ({
        user: p.userId,
        share: p.share,
        approved: p.userId === userId // Auto-approve for creator
      }))
    });

    await expense.save();
    await Group.findByIdAndUpdate(groupId, { $push: { expenses: expense._id } });

    res.status(201).json(expense);
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const expense = await Expense.findById(expenseId)
      .populate('participants.user', 'name email')
      .populate('createdBy', 'name email')
      .populate('comments.user', 'name email'); //comment user name

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({ expense });
  } catch (error) {
    console.error("Error fetching expense:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const approveExpense = async (req, res) => {
  try {
    const { expenseId } = req.body;
    const { userId } = req.user;

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const participant = expense.participants.find(p => p.user.toString() === userId);
    if (!participant) {
      return res.status(403).json({ message: "User not part of this expense" });
    }

    if (participant.approved) {
      return res.status(400).json({ message: "Already approved" });
    }

    participant.approved = true;
    participant.approvedAt = new Date();

    // Check if all participants have approved
    const allApproved = expense.participants.every(p => p.approved);
    if (allApproved) {
      expense.status = 'APPROVED';
      // Here you could trigger notifications or settlement calculations
    }

    await expense.save();
    res.status(200).json({ 
      message: allApproved ? "Expense fully approved" : "Expense approved by user",
      expense 
    });
  } catch (error) {
    console.error("Error approving expense:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { userId } = req.user;

    console.log("expenseId", expenseId);

    const expense = await Expense.findById(expenseId);
    
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Only allow creator or group admin to delete
    const group = await Group.findById(expense.group);

    if (!group.users.includes(userId)) {
      return res.status(403).json({ message: "Not authorized to delete this expense" });
    }


    if (expense.createdBy.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this expense" });
    }

    if (expense.status === 'DELETED') {
      return res.status(400).json({ message: "Expense is already deleted" });
    }

    // Update status to DELETED
    expense.status = 'DELETED';
    expense.updatedAt = new Date();
    await expense.save();

    res.status(200).json({ message: "Expense deleted successfully", expense });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const addComment = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { text } = req.body;
    const { userId } = req.user;

    if (!text || text.length > 50) {
      return res.status(400).json({ 
        message: "Comment must be between 1 and 50 characters" 
      });
    }

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.comments.length >= 50) {
      return res.status(400).json({ 
        message: "Maximum comments limit reached" 
      });
    }

    expense.comments.push({ text, user: userId });
    await expense.save();

    // Populate the newly added comment's user info
    const populatedExpense = await Expense.findById(expenseId)
      .populate('comments.user', 'name email');

    res.status(200).json({ 
      message: "Comment added successfully",
      comments: populatedExpense.comments 
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { expenseId, commentId } = req.params;
    const { userId } = req.user;

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const comment = expense.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Only allow comment creator or expense creator to delete
    if (comment.user.toString() !== userId && 
        expense.createdBy.toString() !== userId) {
      return res.status(403).json({ 
        message: "Not authorized to delete this comment" 
      });
    }
    //comment.remove() -> expense.comments.pull(commentId)
    expense.comments.pull(commentId);
    await expense.save();

    const updatedExpense = await Expense.findById(expenseId)
    .populate('comments.user', 'name email');
  
    res.status(200).json({
      message: "Comment deleted successfully",
      comments: updatedExpense.comments,
    });
  
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createExpense,
  getExpenseById,
  approveExpense,
  deleteExpense,
  addComment,
  deleteComment
};
