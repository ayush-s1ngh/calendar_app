import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated && !loading) {
    return <Navigate to="/calendar" />;
  }

  return (
    <Box>
      <Typography component="h1" variant="h5" align="center">
        Login to Your Account
      </Typography>
      <LoginForm />
    </Box>
  );
};

export default Login;