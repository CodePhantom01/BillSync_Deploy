import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import api from '../services/API';
import Navbar from './Navbar';

const JoinGroup = () => {
  const { invitationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [groupDetails, setGroupDetails] = useState(null);
  const hasAttemptedJoin = useRef(false);

  useEffect(() => {
    if (!hasAttemptedJoin.current) {
      hasAttemptedJoin.current = true;
      handleJoinGroup();
    }
  }, [invitationId]);

  const handleJoinGroup = async () => {
    try {
      setLoading(true);
      
      const response = await api.post(`/groups/join/${invitationId}`);

      console.log(response);

      setSuccess(true);
      
      // Show success message for 2 seconds before redirecting
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to join group';
      setError(errorMessage);
      
      // If user is already a member, redirect after 2 seconds
      if (errorMessage.includes('already a member')) {
        setTimeout(() => {
          navigate('/home');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Processing your invitation...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        p={4}
      >
        <Alert 
          severity="error" 
          sx={{ 
            maxWidth: 600, 
            width: '100%',
            mb: 2 
          }}
        >
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/home')}
        >
          Go to Home
        </Button>
      </Box>
    );
  }

  if (success) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        p={4}
      >
        <Alert 
          severity="success" 
          sx={{ 
            maxWidth: 600, 
            width: '100%',
            mb: 2 
          }}
        >
          Successfully joined the group! Redirecting to home page...
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Navbar />
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="calc(100vh - 64px)"
        p={4}
      >
        <Card sx={{ maxWidth: 600, width: '100%' }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Group Invitation
            </Typography>
            
            {groupDetails && (
              <>
                <Typography variant="body1" gutterBottom>
                  You've been invited to join:
                </Typography>
                
                <Typography variant="h6" color="primary" gutterBottom>
                  {groupDetails.groupId.name}
                </Typography>
                
                {groupDetails.groupId.description && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {groupDetails.groupId.description}
                  </Typography>
                )}
                
                <Typography variant="body2" color="text.secondary">
                  Invited by: {groupDetails.createdBy.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  Members: {groupDetails.groupId.users.length}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default JoinGroup; 