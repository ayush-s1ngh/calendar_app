import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Box, Paper, Typography } from '@mui/material';

const AuthLayout: React.FC = () => {
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Calendar App
          </Typography>
          <Outlet />
        </Paper>
      </Box>
    </Container>
  );
};

export default AuthLayout;