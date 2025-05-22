import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated && !loading) {
    return <Navigate to="/calendar" />;
  }

  return (
    <Box>
      <Typography component="h1" variant="h5" align="center">
        Create New Account
      </Typography>
      <RegisterForm />
    </Box>
  );
};

export default Register;