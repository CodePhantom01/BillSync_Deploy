const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitationController');
const auth = require('../middlewares/authMiddleware');

// Create new invitation
router.post('/create', auth, invitationController.createInvitation);

// Get invitation details
router.get('/:invitationId', invitationController.getInvitation);

// Accept invitation
router.post('/:invitationId/accept', auth, invitationController.acceptInvitation);

module.exports = router; 