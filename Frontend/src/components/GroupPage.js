import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Modal,
  TextField,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  List,
  ListItem,
  Paper,
  Snackbar,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  colors,
  Divider
} from '@mui/material';
import { Add, Remove, ContentCopy } from '@mui/icons-material';

import { Delete as DeleteIcon } from '@mui/icons-material';
import api from '../services/API';
import Navbar from './Navbar';
import { red } from '@mui/material/colors';

const GroupPage = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [participants, setParticipants] = useState([{ userId: '', share: '' }]);
  const [category, setCategory] = useState('OTHERS');

  const [invitationLink, setInvitationLink] = useState('');
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [balanceSummary, setBalanceSummary] = useState({ totalOwe: 0, totalAreOwed: 0, youOwe: [], youAreOwed: [] });
  const [currentUser, setCurrentUser] = useState(null);


  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await api.get(`/groups/get/${groupId}`);
        setGroup(response.data.group);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load group.');
      } finally {
        setLoading(false);
      }
    };
    const fetchBalances = async () => {
      try {
        const [balRes, userRes] = await Promise.all([
          api.get(`/groups/${groupId}/balances`),
          api.get('/auth/current-user')
        ]);
        setBalanceSummary(balRes.data);
        setCurrentUser(userRes.data.user);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load balances.');
      }
    };
    fetchGroup();
    fetchBalances();
  }, [groupId]);


  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleParticipantChange = (index, field, value) => {
    const newParticipants = [...participants];
    newParticipants[index][field] = value;
    setParticipants(newParticipants);
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await api.delete(`/expenses/delete/${expenseId}`);
      // Update the local state to reflect the deletion
      setGroup(prevGroup => ({
        ...prevGroup,
        expenses: prevGroup.expenses.map(expense => 
          expense._id === expenseId 
            ? { ...expense, status: 'DELETED' }
            : expense
        )
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      PENDING: { color: 'warning', label: 'Pending' },
      APPROVED: { color: 'success', label: 'Approved' },
      REJECTED: { color: 'error', label: 'Rejected' },
      DELETED: { color: 'default', label: 'Deleted' }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return <Chip size="small" color={config.color} label={config.label} />;
  };

  const handleAddParticipant = () => {
    setParticipants([...participants, { userId: '', share: '' }]);
  };

  const handleRemoveParticipant = (index) => {
    const newParticipants = participants.filter((_, i) => i !== index);
    setParticipants(newParticipants);
  };

  const validateForm = () => {
    if (!paidBy) {
      setError('Please select who paid');
      return false;
    }
  
    const total = participants.reduce((sum, p) => sum + Number(p.share), 0);
    if (total !== Number(amount)) {
      setError('Total shares must equal the expense amount');
      return false;
    }
  
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const response = await api.post(`/expenses/create`, {
        groupId,
        description,
        amount: Number(amount),
        category,
        paidBy,
        participants: participants.map(p => ({
          userId: p.userId,
          share: Number(p.share)
        }))
      });
      setGroup((prevGroup) => ({
        ...prevGroup,
        expenses: [...prevGroup.expenses, response.data],
      }));
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense.');
    }
  };

  const handleExpenseClick = (expenseId) => {
    navigate(`/expense/${expenseId}`);
  };


  const handleCreateInvitation = async () => {
    setInvitationLoading(true);
    try {
      const response = await api.post('/invitations/create', {
        groupId: group._id
      });
      setInvitationLink(response.data.invitation.link);
      setShowInvitationModal(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create invitation');
    } finally {
      setInvitationLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(invitationLink);
    setSnackbar({
      open: true,
      message: 'Invitation link copied to clipboard!',
      severity: 'success'
    });
  };

  const handleCloseInvitationModal = () => {
    setShowInvitationModal(false);
    setInvitationLink('');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };


  const ExpenseItem = ({ expense }) => {
    const isDeleted = expense.status === 'DELETED';
    
    return (
      <ListItem 
        sx={{
          opacity: isDeleted ? 0.7 : 1,
          pointerEvents: isDeleted ? 'none' : 'auto'
        }}
      >
        <Paper 
          elevation={2} 
          sx={{ 
            width: '100%', 
            padding: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            textDecoration: isDeleted ? 'line-through' : 'none',
            backgroundColor: isDeleted ? '#f5f5f5' : 'white'
          }}
        >
          <Box 
            onClick={() => !isDeleted && handleExpenseClick(expense._id)}
            sx={{ flexGrow: 1 }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body1" component="span">
                {expense.description}
              </Typography>
              {getStatusChip(expense.status)}
            </Box>
            <Typography variant="body2">
              Amount: ${expense.amount}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Last updated: {new Date(expense.updatedAt).toLocaleDateString()}
            </Typography>
          </Box>
          
          {!isDeleted && expense.status !== 'APPROVED' && (
            <IconButton 
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to delete this expense?')) {
                  handleDeleteExpense(expense._id);
                }
              }}
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Paper>
      </ListItem>
    );
  };

  return (
    <Box>
      <Navbar />
      <Box p={4} bgcolor='rgb(217,236,230)'>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <Box 
              sx={{
                display: 'flex',
                flexDirection: {
                  xs: 'column',
                  sm: 'row',
                },
                justifyContent: {
                  xs: 'flex-start',
                  sm: 'space-between',
                },
                alignItems: {
                  xs: 'flex-start',
                  sm: 'center',
                },
                gap: 1,           
                mb: 2,             
                bgcolor: 'white',
                p: 3,                     
                borderRadius: 2,
                maxWidth: '100%',
                bgcolor:'#93d1ff',
              }}              
            >
              <Typography
                variant="h4"
                sx={{
                  fontSize: {
                    xs: '18px', 
                    sm: '20px', 
                    md: '24px',  
                    lg: '28px',  
                  },
                  fontWeight: {
                    xs: 550,
                    sm: 600,
                    md: 700,
                  },
                  color: 'black',
                }}
              >
                {group.name}
              </Typography>
              <Box
                sx={{
                  maxWidth: '175px',
                  display: 'flex',
                  flexDirection: {
                    xs: 'row',
                    sm: 'row',    
                  },
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: {
                    xs: 1,
                    sm: 2,
                  },
                }}
              >
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleCreateInvitation}
                  disabled={invitationLoading}
                  sx={{
                    bgcolor:'white',
                    color:'#1E3A8A',
                    border: '1px solid #1E3A8A',
                    padding: '2px 6px', 
                    fontSize: {
                      xs: '12px',  
                      sm: '12px',   
                      md: '12px',  
                      lg: '12px',
                    },    
                    minWidth: 'auto',         
                    lineHeight: 1.2,        
                    textTransform: 'none', 
                    fontWeight: {
                      xs: 400,
                      sm: 500,
                      md: 600,
                    }    
                  }}
                >
                  {invitationLoading ? 'Creating...' : 'Invite Members'}
                </Button>
                    <Button variant="contained" color="primary" onClick={handleOpen} sx={{
                      bgcolor:'#1E3A8A',
                      padding: '2px 6px',        
                      fontSize: {
                        xs: '12px',  
                        sm: '12px',   
                        md: '12px',  
                        lg: '12px',
                      },    
                      fontWeight: {
                        xs: 400,
                        sm: 500,
                        md: 600,
                      }, 
                      color:'white',
                      minWidth: 'auto',          
                      lineHeight: 1.2,           
                      textTransform: 'none',    
                    }}>
                  Add Expense
                </Button>
              </Box>
            </Box>
            <Divider sx={{ borderColor: 'black',backgroundColor: 'black', my: 2 , width: '100%', height: '1px'}} />
            <Modal open={open} onClose={handleClose}>
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: { xs: '90%', sm: 400 },
                  bgcolor: 'white',
                  boxShadow: 24,
                  p: 3,
                  borderRadius: '12px',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Add Expense
                </Typography>

                <TextField
                  label="Description"
                  fullWidth
                  margin="normal"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />

                <TextField
                  label="Amount"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />

                <FormControl fullWidth margin="normal" required error={!paidBy}>
                  <InputLabel>Paid By</InputLabel>
                  <Select
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    label="Paid By"
                  >
                    {group?.users.map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {!paidBy && (
                    <FormHelperText>Please select who paid</FormHelperText>
                  )}
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    label="Category"
                  >
                    <MenuItem value="FOOD">Food</MenuItem>
                    <MenuItem value="TRANSPORT">Transport</MenuItem>
                    <MenuItem value="ENTERTAINMENT">Entertainment</MenuItem>
                    <MenuItem value="SHOPPING">Shopping</MenuItem>
                    <MenuItem value="OTHERS">Others</MenuItem>
                  </Select>
                </FormControl>

                <Typography variant="h6" gutterBottom mt={2}>
                  Participants
                </Typography>

                {participants.map((participant, index) => (
                  <Box
                    key={index}
                    display="flex"
                    flexDirection={{ xs: 'column', sm: 'row' }}
                    alignItems="center"
                    gap={1}
                    mb={2}
                  >
                    <FormControl fullWidth required>
                      <InputLabel>User</InputLabel>
                      <Select
                        value={participant.userId}
                        onChange={(e) =>
                          handleParticipantChange(index, 'userId', e.target.value)
                        }
                        label="User"
                      >
                        {group.users.map((user) => (
                          <MenuItem key={user._id} value={user._id}>
                            {user.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      label="Share"
                      type="number"
                      fullWidth
                      value={participant.share}
                      onChange={(e) =>
                        handleParticipantChange(index, 'share', e.target.value)
                      }
                      required
                    />

                    <IconButton
                      onClick={() => handleRemoveParticipant(index)}
                      sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}
                    >
                      <Remove />
                    </IconButton>
                  </Box>
                ))}

                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 1, mb: 2 }}
                  onClick={handleAddParticipant}
                >
                  Add Participant
                </Button>

                <Button type="submit" variant="contained" color="primary" fullWidth>
                  Add
                </Button>
              </Box>
            </Modal>


            {/* Invitation Modal */}
            <Modal
              open={showInvitationModal}
              onClose={handleCloseInvitationModal}
              aria-labelledby="invitation-modal"
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: { xs: '90%', sm: 400 },
                  bgcolor: 'background.paper',
                  boxShadow: 24,
                  p: { xs: 2, sm: 4 },
                  borderRadius: '12px', 
                }}
              >
                <Typography variant="h6" component="h2" gutterBottom>
                  Invitation Link
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Share this link with people you want to invite to the group:
                </Typography>

                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1,
                  }}
                >
                  <TextField
                    fullWidth
                    value={invitationLink}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    size="small"
                  />
                  <IconButton
                    onClick={handleCopyLink}
                    color="primary"
                    sx={{
                      alignSelf: { xs: 'flex-end', sm: 'center' },
                    }}
                  >
                    <ContentCopy />
                  </IconButton>
                </Box>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button onClick={handleCloseInvitationModal}>Close</Button>
                </Box>
              </Box>
            </Modal>


            {/* Snackbar for notifications */}
            <Snackbar
              open={snackbar.open}
              autoHideDuration={3000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                {snackbar.message}
              </Alert>
            </Snackbar>

            <Box mb={4} p={2} sx={{ bgcolor: 'white', borderRadius: '12px' }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, fontWeight: 600 }}
              >
                My Group Balances:
              </Typography>

              {balanceSummary.summary && (
                <Box
                  p={2}
                  sx={{ bgcolor: 'rgb(217,236,230)', borderRadius: '12px' }}
                  display="flex"
                  flexDirection={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  gap={1}
                  mb={2}
                >
                  {balanceSummary.summary.totalOwe > 0 ? (
                    <Typography
                      sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                    >
                      <Box component="span" sx={{ color: 'black' }}>You owe </Box>
                      <Box component="span" sx={{ color: 'error.main' }}>
                        ${balanceSummary.summary.totalOwe.toFixed(2)}
                      </Box>
                    </Typography>
                  ) : (
                    <Typography
                      sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, color: 'black' }}
                    >
                      You owe nothing
                    </Typography>
                  )}

                  {balanceSummary.summary.totalAreOwed > 0 ? (
                    <Typography
                      sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                    >
                      <Box component="span" sx={{ color: 'black' }}>You are owed </Box>
                      <Box component="span" sx={{ color: 'success.main' }}>
                        ${balanceSummary.summary.totalAreOwed.toFixed(2)}
                      </Box>
                    </Typography>
                  ) : (
                    <Typography
                      sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, color: 'black' }}
                    >
                      No one owes you
                    </Typography>
                  )}
                </Box>
              )}

              {balanceSummary.youOwe.length > 0 && (
                <Box mt={2}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ fontSize: { xs: '0.95rem', sm: '1.05rem' }, fontWeight: 600 }}
                  >
                    You will pay:
                  </Typography>
                  <Grid container spacing={2}>
                    {balanceSummary.youOwe.map((item, idx) => (
                      <Grid item xs={12} sm={6} md={4} key={item.to.userId || idx}>
                        <Paper
                          elevation={3}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            backgroundColor: '#fff5f5',
                          }}
                        >
                          <Typography
                            sx={{ fontWeight: 'bold', fontSize: { xs: '0.95rem', sm: '1rem' } }}
                          >
                            {item.to.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' } }}
                          >
                            {item.to.email}
                          </Typography>
                          <Typography
                            sx={{ color: 'error.main', fontWeight: 500, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}
                          >
                            Owe: ${item.amount.toFixed(2)}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {balanceSummary.youAreOwed.length > 0 && (
                <Box mt={4}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ fontSize: { xs: '0.95rem', sm: '1.05rem' }, fontWeight: 600 }}
                  >
                    You will receive:
                  </Typography>
                  <Grid container spacing={2}>
                    {balanceSummary.youAreOwed.map((item, idx) => (
                      <Grid item xs={12} sm={6} md={4} key={item.from.userId || idx}>
                        <Paper
                          elevation={3}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            backgroundColor: '#f0fff4',
                          }}
                        >
                          <Typography
                            sx={{ fontWeight: 'bold', fontSize: { xs: '0.95rem', sm: '1rem' } }}
                          >
                            {item.from.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' } }}
                          >
                            {item.from.email}
                          </Typography>
                          <Typography
                            sx={{ color: 'success.main', fontWeight: 500, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}
                          >
                            Get: ${item.amount.toFixed(2)}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>
            <Divider sx={{ borderColor: 'black',backgroundColor: 'black', width: '100%', height: '1px'}} />
            <Box mt={4} px={{ xs: 1, sm: 2, md: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, fontWeight: 600 }}
              >
                Expenses
              </Typography>

              <List
                sx={{
                  width: '100%',
                  maxWidth: '100%',
                  bgcolor: 'background.paper',
                  borderRadius: '12px',
                }}
              >
                {group.expenses
                  .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                  .map((expense) => (
                    <Box key={expense._id} mb={1}>
                      <ExpenseItem expense={expense} />
                    </Box>
                  ))}
              </List>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default GroupPage;