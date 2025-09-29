import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ListItem, Paper, Typography } from '@mui/material';

const GroupItem = ({ id, name, users }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/group/${id}`);
  };

  return (
    <ListItem onClick={handleClick} style={{ cursor: 'pointer' }}>
      <Paper elevation={2} sx={{ width: '100%', padding: 2 }}>
        <Typography variant="h6">{name}</Typography>
        <Typography variant="body2">Members: {users.length}</Typography>
      </Paper>
    </ListItem>
  );
};

export default GroupItem;