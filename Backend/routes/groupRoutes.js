const express = require('express');
const {
    createGroup,
    sendInvite,
    joinGroup,
    getGroupById,
    getGroupsByUser,
    getGroupBalances
  } = require('../controllers/groupController');

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

router.post('/create', authMiddleware, createGroup);

router.post('/join/:invitationId', authMiddleware, joinGroup);

router.get('/get/:groupId', authMiddleware, getGroupById);

router.get('/get', authMiddleware, getGroupsByUser);

router.post('/invite', authMiddleware, sendInvite);

router.get('/:groupId/balances', authMiddleware, getGroupBalances);

module.exports = router;
