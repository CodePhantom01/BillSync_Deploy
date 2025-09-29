import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Alert, Paper, List,
  ListItem, ListItemText, Button, Chip, Grid, Divider, ListItemSecondary, TextField, IconButton
} from '@mui/material';
import { Delete as DeleteIcon, Send as SendIcon } from '@mui/icons-material';
import api from '../services/API.js';
import Navbar from './Navbar';

const ExpenseDetailsPage = () => {
  const { expenseId } = useParams();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expenseRes, userRes] = await Promise.all([
          api.get(`/expenses/get/${expenseId}`),
          api.get('/auth/current-user')
        ]);
        setExpense(expenseRes.data.expense);
        setCurrentUser(userRes.data.user);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [expenseId]);

  const handleApprove = async () => {
    try {
      await api.post('/expenses/approve', { expenseId });
      // Refresh expense data
      const response = await api.get(`/expenses/get/${expenseId}`);
      setExpense(response.data.expense);
    } catch (err) {
      setError(err.response?.data?.message);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await api.delete(`/expenses/delete/${expenseId}`);
      // Update the local state to reflect the deletion
      setExpense(prevExpense => ({
        ...prevExpense,
        status: 'DELETED'
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await api.post(`/expenses/${expenseId}/comments`, {
        text: newComment
      });
      
      setExpense(prev => ({
        ...prev,
        comments: response.data.comments
      }));
      setNewComment('');
      setCommentError('');
    } catch (err) {
      setCommentError(err.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await api.delete(
        `/expenses/${expenseId}/comments/${commentId}`
      );

      setExpense(prev => ({
        ...prev,
        comments: response.data.comments
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  const getStatusChip = (status) => {
    const colors = {
      PENDING: 'warning',
      APPROVED: 'success',
      REJECTED: 'error',
      DELETED: 'default'
    };
    return <Chip label={status} color={colors[status]} sx={{fontWeight: 500,
      p:0.025,
      borderRadius: '16px',
      fontSize: {xs:'12px',sm:'14px'}}}/>;
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Navbar />
      <Box p={4} bgcolor={'rgb(217,236,230)'}>
        {/*first Box*/}
        <Paper elevation={2} sx={{ p: 3, bgcolor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: 2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)' }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={2} p={1} bgcolor={'#93d1FF'} borderRadius={2}>
                <Typography
                  variant="h4"
                  sx={{
                    textDecoration: expense.status === 'DELETED' ? 'line-through' : 'none',
                    color: expense.status === 'DELETED' ? 'text.secondary' : 'text.primary',
                    fontSize:{xs:'16px', sm:'20px'},
                    fontWeight: { xs: 550, sm: 700 }
                  }}
                >
                  🧾{expense.description}
                </Typography>
                {getStatusChip(expense.status)}
              </Box>
            </Grid>

            <Grid
              item
              xs={12}
              p={1}
              bgcolor={'rgb(217,236,230)'}
              borderRadius={'12px'}
              sx={{width:'100%', marginLeft: '25px', marginTop: '5px' , marginBottom:'-20px'}}
            >
              <Typography
                variant="h6"
                sx={{ fontSize: { xs: '1rem', sm: '1.2rem' }, fontWeight: 600 }}
              >
                Details
              </Typography>

              <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                Amount: ${expense.amount}
              </Typography>

              <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                Category: {expense.category}
              </Typography>

              <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                Split Type: {expense.splitType}
              </Typography>

              <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                Created by: {expense.createdBy.name}
              </Typography>

              <Typography sx={{ fontSize: { xs: '0.7rem', sm: '0.85rem' }, color: 'text.secondary' }}>
                Last updated: {new Date(expense.updatedAt).toLocaleString()}
              </Typography>
            </Grid>


            <Grid item xs={12}>
            <Divider sx={{ borderColor: 'black',backgroundColor: 'black', my: 2 , width: '100%', height: '1px'}} />
              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.2rem' }, fontWeight: 600 }}>👥 Participants</Typography>
              <List>
                {expense.participants.map((participant) => (
                  <ListItem key={participant._id}>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, fontWeight: 500 }}>
                          {participant.user.name}
                        </Typography>
                      }
                      secondary={
                        <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' }, color: 'text.secondary' }}>
                          Share: ${participant.share}
                        </Typography>
                      }
                    />
                    <Chip
                      sx={{
                        fontWeight: 500,
                        px: 1,
                        borderRadius: '16px',
                        fontSize: { xs: '0.7rem', sm: '0.85rem' } // Chip label font size
                      }}
                      label={participant.approved ? "Approved" : "Pending"}
                      color={participant.approved ? "success" : "warning"}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>

            {expense.status === 'PENDING' && (
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleApprove}
                  disabled={expense.participants.find(p =>
                    p.user._id === currentUser._id)?.approved}
                >
                  Approve Expense
                </Button>
              </Grid>
            )}

            {expense.status !== 'DELETED' && expense.status !== 'APPROVED' && (
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this expense?')) {
                      handleDeleteExpense(expense._id);
                    }
                  }}
                >
                  Delete Expense
                </Button>
              </Grid>
            )}
          </Grid>
        </Paper>
        {/*second box*/}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mt: 3,
            bgcolor: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)'
          }}
        >
          {/* Header */}
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontSize: { xs: '1rem', sm: '1.2rem' }, fontWeight: 600 }}
          >
            💬 Comments ({expense.comments?.length || 0}/50)
          </Typography>

          {/* Comment Input */}
          <Box
            component="form"
            onSubmit={handleAddComment}
            sx={{ display: 'flex', gap: 1, mb: 2 , borderRadius: '12px'}}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Add a comment (max 50 characters)"
              value={newComment}
              onChange={(e) => {
                if (e.target.value.length <= 50) {
                  setNewComment(e.target.value);
                  setCommentError('');
                }
              }}
              error={!!commentError}
              helperText={
                <Typography sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                  {commentError || `${newComment.length}/50`}
                </Typography>
              }
              disabled={
                expense.status === 'DELETED' ||
                expense.comments?.length >= 50
              }
            />
            <IconButton
              type="submit"
              color="primary"
              disabled={
                !newComment.trim() ||
                expense.status === 'DELETED' ||
                expense.comments?.length >= 50
              }
            >
              <SendIcon />
            </IconButton>
          </Box>

          {/* Comments List */}
          <List>
            {expense.comments?.map((comment) => (
              <ListItem
                key={comment._id}
                secondaryAction={
                  (comment.user._id === currentUser?._id ||
                    expense.createdBy._id === currentUser?._id) && (
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleDeleteComment(comment._id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )
                }
              >
                <ListItemText sx={{bgcolor:'#CAF0F8', borderRadius:'8px', boxShadow:'0 1px 3px rgba(0, 0, 0, 0.25)'}}
                  primary={
                    <Typography p={1} sx={{ fontSize: { xs: '0.9rem', sm: '1rem'}, color:'#1B1B1B'}}>
                      {comment.text}
                    </Typography>
                  }
                  secondary={ 
                    <Typography p={1} marginTop={-1.75}
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.85rem' },
                        color: '#5E5E5E' // default color for timestamp
                      }}
                    >
                      <Box component="span" sx={{ color: '#1C4E80', fontWeight: 500 }}>
                        {comment.user.name}
                      </Box>{' '}
                      • {new Date(comment.createdAt).toLocaleString()}
                    </Typography>
                  }                  
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Box>
  );
};

export default ExpenseDetailsPage;