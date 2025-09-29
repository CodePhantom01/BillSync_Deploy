import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  List, 
  ListItem, 
  ListItemText, 
  Paper,
  Button,
  Modal,
  TextField,
  IconButton
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import api from '../services/API';
import GroupItem from './GroupItem'; // Import the GroupItem component
import Navbar from './Navbar'; // Import the Navbar component

const HomePage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups/get');
      setGroups(response.data.groups || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load groups.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setNewGroupName('');
    setError('');
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      setError('Group name is required');
      return;
    }

    setCreateLoading(true);
    try {
      const response = await api.post('/groups/create', {
        name: newGroupName.trim()
      });
      
      setGroups(prevGroups => [...prevGroups, response.data]);
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <Box height={'100vh'} bgcolor={'rgb(217,236,230)'}>
      {/* Render Navbar */}
      <Navbar />

      <Box p={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} p={2} sx={{bgcolor:'#93d1ff', borderRadius:'12px'}}>
          <Typography variant="h4"x sx={{fontSize: {xs:'18px', sm:'24px'}, fontWeight:{xs:'550', sm:'600'}}}>
            Your Groups
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            sx={{fontSize: {xs:'12px', sm:'16px'},bgcolor:'#1E3A8A'}}
          >
            Create Group
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : groups.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              You haven't created any groups yet
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenModal}
              sx={{ mt: 2 }}
            >
              Create Your First Group
            </Button>
          </Paper>
        ) : (
          <List sx={{bgcolor:'#e0f0ff', borderRadius:'12px', '& .MuiTypography-root': {
            fontSize: {
              xs: '1rem',   
              sm: '1.25rem'
            },
            fontWeight: {
              xs: 450,
              sm: 500
            }
          }}}>
            {groups.map((group) => (
              <GroupItem 
                key={group._id}
                id={group._id} 
                name={group.name} 
                users={group.users} 
              />
            ))}
          </List>
        )}
      </Box>

      {/* Create Group Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="create-group-modal"
      >
        <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: 400,
              bgcolor: '#ffffff',
              boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.15)',
              p: { xs: 3, sm: 4 },
              borderRadius: 3,
              border: '1px solid #e0e0e0', 
              backdropFilter: 'blur(6px)', 
            }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Create New Group
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleCreateGroup}>
            <TextField
              fullWidth
              label="Group Name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              margin="normal"
              required
              autoFocus
              disabled={createLoading}
            />

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                onClick={handleCloseModal}
                disabled={createLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={createLoading}
                startIcon={createLoading && <CircularProgress size={20} />}
              >
                {createLoading ? 'Creating...' : 'Create Group'}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </Box>
  );
};

export default HomePage;
