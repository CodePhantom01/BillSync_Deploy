import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear token and redirect to login page
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: 'rgb(184,207,199)'}}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, color:'black',':hover': { color: 'blue', background: 'transparent'}, }}>
          BillSync
        </Typography>
        <Button color="inherit" onClick={handleLogout} sx={{ fontWeight: 600, color:'black',fontSize: '16px', ':hover': { color: 'blue', background: 'transparent'} }}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
