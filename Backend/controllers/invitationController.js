const Invitation = require('../models/Invitation');
const Group = require('../models/Group');
const User = require('../models/User');

// Create a new invitation
exports.createInvitation = async (req, res) => {
    try {
        const { groupId } = req.body;
        const createdBy = req.user.userId;

        // Validate if group exists and user is a member
        const group = await Group.findOne({ _id: groupId, users: createdBy });
        if (!group) {
            return res.status(404).json({ message: 'Group not found or you are not a member' });
        }

        let invitation = await Invitation.findOne({ groupId: groupId });

        console.log(invitation);

        if(!invitation) {
            invitation = new Invitation({
                groupId,
                createdBy
            });
    
            await invitation.save(); 
        }

        // Generate invitation link
        const invitationLink = `${process.env.FRONTEND_URL}/join/${invitation._id}`;

        res.status(201).json({
            message: 'Invitation created successfully',
            invitation: {
                id: invitation._id,
                groupId: invitation.groupId,
                createdAt: invitation.createdAt,
                status: invitation.status,
                link: invitationLink
            }
        });
    } catch (error) {
        console.error('Error creating invitation:', error);
        res.status(500).json({
            message: 'Error creating invitation',
            error: error.message
        });
    }
};

// Get invitation details
exports.getInvitation = async (req, res) => {
    try {
        const { invitationId } = req.params;

        const invitation = await Invitation.findById(invitationId)
            .populate('createdBy', 'name email')
            .populate({
                path: 'groupId',
                select: 'name description users',
                populate: {
                    path: 'users',
                    select: 'name email'
                }
            });

        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        if (invitation.status === 'EXPIRED') {
            return res.status(400).json({ message: 'Invitation has expired' });
        }

        res.status(200).json({
            message: 'Invitation retrieved successfully',
            invitation
        });
    } catch (error) {
        console.error('Error fetching invitation:', error);
        res.status(500).json({
            message: 'Error fetching invitation',
            error: error.message
        });
    }
};

// Accept invitation
exports.acceptInvitation = async (req, res) => {
    try {
        const { invitationId } = req.params;
        const userId = req.user.userId;

        const invitation = await Invitation.findById(invitationId);
        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        if (invitation.status === 'EXPIRED') {
            return res.status(400).json({ message: 'Invitation has expired' });
        }

        // Add user to group
        const group = await Group.findById(invitation.groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is already a member
        if (group.users.includes(userId)) {
            return res.status(400).json({ message: 'You are already a member of this group' });
        }

        // Add user to group
        group.users.push(userId);
        await group.save();

        // Update user's groups array
        await User.findByIdAndUpdate(userId, {
            $addToSet: { groups: group._id }
        });

        // Mark invitation as expired
        invitation.status = 'EXPIRED';
        await invitation.save();

        res.status(200).json({
            message: 'Successfully joined the group',
            group
        });
    } catch (error) {
        console.error('Error accepting invitation:', error);
        res.status(500).json({
            message: 'Error accepting invitation',
            error: error.message
        });
    }
}; 