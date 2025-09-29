const Group = require('../models/Group');
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const Expense = require('../models/Expense');

// Create Group
const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    console.log(req.user.userId);
    const createdBy = req.user.userId;
    const group = new Group({ 
      name, 
      createdBy,
      users: [req.user.userId] });
    console.log(group);
    await group.save();
    res.status(201).json(group);
} catch (error) {
    res.status(500).json({ error: error.message });
}
};

const joinGroup = async (req, res) => {
  const { invitationId } = req.params;
  const { userId } = req.user; 
  const invitation = await Invitation.findById(invitationId);
  if (!invitation) {
    return res.status(404).json({ message: 'Invitation not found' });
  }

  const groupId = invitation.groupId;

  try {
    // Step 1: Atomically add the user to the group using $addToSet
    const group = await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { users: userId } },
      { new: true }
    );
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Step 2: Check if the user was already a member
    if (!group.users.some(user => user.toString() === userId)) {
      // This should not happen, but just in case
      return res.status(400).json({ message: 'You are already a member of this group' });
    }

    // Step 3: Atomically add the group to the user's list of groups
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { groups: groupId } }
    );

    // Send success response
    res.status(200).json({ message: 'You have successfully joined the group', group });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getGroupById = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.user;  // The userId comes from the token after authMiddleware

  try {
    const group = await Group.findById(groupId)
    .populate('expenses')
    .populate('users');
    console.log(group);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Step 2: Check if the user is already a member of the group
    if (group.users.some(user => user._id.toString() === userId)) {
      return res.status(200).json({ message: 'success', group });
    }

    return res.status(400).json({ message: 'You are not member of this group' });

  } catch (error) {
    console.error('Error getting group:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getGroupsByUser = async (req, res) => {
  const { userId } = req.user; // The userId comes from the token after authMiddleware

  try {
    // Step 1: Fetch all groups where the user is a member
    const groups = await Group.find({ users: userId });

    // Step 2: Check if the user is part of any groups
    if (!groups.length) {
      return res.status(404).json({ message: "You are not a member of any groups" });
    }

    // Step 3: Return the groups
    res.status(200).json({ message: "success", groups });
  } catch (error) {
    console.error("Error fetching groups for user:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const sendInvite = async (email, phone, groupId) => {
  const message = `You're invited to join a group in the Split app. Use this link to join: https://billsync-phi.vercel.app/groups/join/${groupId}`;
  //const message = `You're invited to join a group in the Split app. Use this link to join: http://localhost:3000/groups/join/${groupId}`;
  res.status(200).json({ message: message });
  // // Send email invite
  // const transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: 'your-email@gmail.com', // Replace with your email
  //     pass: 'your-email-password',   // Replace with your email password
  //   },
  // });

  // const mailOptions = {
  //   from: 'your-email@gmail.com',
  //   to: email,
  //   subject: 'Group Invitation',
  //   text: message,
  // };

  // await transporter.sendMail(mailOptions);

  // // Send WhatsApp invite (Twilio example)
  // const client = twilio('your-account-sid', 'your-auth-token');
  
  // await client.messages.create({
  //   body: message,
  //   from: 'whatsapp:+1415XXXXXXX',  // Your Twilio WhatsApp number
  //   to: `whatsapp:${phone}`,
  // });
};

const getGroupBalances = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;
    const group = await Group.findById(groupId).populate('users', 'name email');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    // Fetch all approved expenses for the group
    const expenses = await Expense.find({ group: groupId, status: 'APPROVED' }).populate('participants.user paidBy');
    // Initialize balances
    const balances = {};
    group.users.forEach(user => {
      balances[user._id] = { userId: user._id.toString(), name: user.name, email: user.email, balance: 0 };
    });
    // Calculate balances
    expenses.forEach(expense => {
      balances[expense.paidBy._id.toString()].balance += expense.amount;
      expense.participants.forEach(part => {
        balances[part.user._id.toString()].balance -= part.share;
      });
    });
    // Calculate settlements (who pays whom)
    // Greedy algorithm: sort debtors and creditors, match payments
    const creditors = Object.values(balances).filter(b => b.balance > 0).map(b => ({ ...b }));
    const debtors = Object.values(balances).filter(b => b.balance < 0).map(b => ({ ...b }));
    creditors.sort((a, b) => b.balance - a.balance);
    debtors.sort((a, b) => a.balance - b.balance);
    const settlements = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(-debtor.balance, creditor.balance);
      if (amount > 0) {
        settlements.push({ from: debtor, to: creditor, amount });
        debtor.balance += amount;
        creditor.balance -= amount;
      }
      if (Math.abs(debtor.balance) < 1e-6) i++;
      if (Math.abs(creditor.balance) < 1e-6) j++;
    }
    // For the current user, show what they owe and what they are owed
    const youOwe = settlements.filter(s => s.from.userId === userId).map(s => ({ to: s.to, amount: s.amount }));
    const youAreOwed = settlements.filter(s => s.to.userId === userId).map(s => ({ from: s.from, amount: s.amount }));
    const totalOwe = youOwe.reduce((sum, s) => sum + s.amount, 0);
    const totalAreOwed = youAreOwed.reduce((sum, s) => sum + s.amount, 0);
    res.status(200).json({
      summary: {
        totalOwe,
        totalAreOwed
      },
      youOwe,
      youAreOwed
    });
  } catch (error) {
    console.error('Error calculating group balances:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createGroup,
  sendInvite,
  joinGroup,
  getGroupById,
  getGroupsByUser,
  getGroupBalances
};
