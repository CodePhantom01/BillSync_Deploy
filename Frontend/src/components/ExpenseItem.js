// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//   Box,
//   Typography,
//   Button,
//   Modal,
//   TextField,
//   FormControl,
//   FormHelperText,
//   InputLabel,
//   Select,
//   MenuItem,
//   IconButton,
//   List,
//   ListItem,
//   Paper,
//   CircularProgress,
//   Alert,
//   Chip
// } from '@mui/material';
// import { Delete as DeleteIcon } from '@mui/icons-material';
// import api from '../services/API';

// const handleExpenseClick = (expenseId) => {
//     const navigate = useNavigate();
//     navigate(`/expense/${expenseId}`);
//   };

//   const handleDeleteExpense = async (expenseId) => {
//     try {
//       await api.delete(`/expenses/delete/${expenseId}`);
//       // Update the local state to reflect the deletion
//       setGroup(prevGroup => ({
//         ...prevGroup,
//         expenses: prevGroup.expenses.map(expense => 
//           expense._id === expenseId 
//             ? { ...expense, status: 'DELETED' }
//             : expense
//         )
//       }));
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to delete expense');
//     }
//   };

// const ExpenseItem = ({ expense }) => {

//     const isDeleted = expense.status === 'DELETED';
    
//     return (
//       <ListItem 
//         sx={{
//           opacity: isDeleted ? 0.7 : 1,
//           pointerEvents: isDeleted ? 'none' : 'auto'
//         }}
//       >
//         <Paper 
//           elevation={2} 
//           sx={{ 
//             width: '100%', 
//             padding: 2,
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             textDecoration: isDeleted ? 'line-through' : 'none',
//             backgroundColor: isDeleted ? '#f5f5f5' : 'white'
//           }}
//         >
//           <Box 
//             onClick={() => !isDeleted && handleExpenseClick(expense._id)}
//             sx={{ flexGrow: 1 }}
//           >
//             <Box display="flex" alignItems="center" gap={1}>
//               <Typography variant="body1" component="span">
//                 {expense.description}
//               </Typography>
//               {getStatusChip(expense.status)}
//             </Box>
//             <Typography variant="body2">
//               Amount: ${expense.amount}
//             </Typography>
//             <Typography variant="caption" color="textSecondary">
//               Last updated: {new Date(expense.updatedAt).toLocaleDateString()}
//             </Typography>
//           </Box>
          
//           {!isDeleted && expense.status !== 'APPROVED' && (
//             <IconButton 
//               onClick={(e) => {
//                 e.stopPropagation();
//                 if (window.confirm('Are you sure you want to delete this expense?')) {
//                   handleDeleteExpense(expense._id);
//                 }
//               }}
//               color="error"
//               size="small"
//             >
//               <DeleteIcon />
//             </IconButton>
//           )}
//         </Paper>
//       </ListItem>
//     );
//   };

// export default ExpenseItem;