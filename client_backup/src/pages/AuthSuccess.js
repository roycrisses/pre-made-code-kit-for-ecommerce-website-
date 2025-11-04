import React, { useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Authentication failed. Please try again.');
      navigate('/login');
      return;
    }

    if (token) {
      // Store token and get user data
      localStorage.setItem('token', token);
      
      // Fetch user data with the token
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(userData => {
        login(token, userData);
        toast.success('Successfully logged in with Google!');
        navigate('/');
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
      });
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, login]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2
      }}
    >
      <CircularProgress />
      <Typography variant="h6">
        Completing authentication...
      </Typography>
    </Box>
  );
};

export default AuthSuccess;
