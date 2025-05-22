import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { register } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const validationSchema = yup.object({
  username: yup
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .required('Username is required'),
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

const RegisterForm: React.FC = () => {
  const [error, setError] = React.useState<string | null>(null);
  const { setAuthTokens, setUser } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const { confirmPassword, ...registerData } = values;
        const response = await register(registerData);

        if (response.success && response.data) {
          setAuthTokens(response.data.tokens);
          setUser(response.data.user);
          navigate('/calendar');
        } else {
          setError(response.message || 'Registration failed');
        }
      } catch (error: any) {
        setError(error.response?.data?.message || 'An error occurred during registration');
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%', mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        id="username"
        name="username"
        label="Username"
        margin="normal"
        variant="outlined"
        value={formik.values.username}
        onChange={formik.handleChange}
        error={formik.touched.username && Boolean(formik.errors.username)}
        helperText={formik.touched.username && formik.errors.username}
      />

      <TextField
        fullWidth
        id="email"
        name="email"
        label="Email"
        margin="normal"
        variant="outlined"
        value={formik.values.email}
        onChange={formik.handleChange}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
      />

      <TextField
        fullWidth
        id="password"
        name="password"
        label="Password"
        type="password"
        margin="normal"
        variant="outlined"
        value={formik.values.password}
        onChange={formik.handleChange}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
      />

      <TextField
        fullWidth
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        margin="normal"
        variant="outlined"
        value={formik.values.confirmPassword}
        onChange={formik.handleChange}
        error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
        helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        sx={{ mt: 3, mb: 2 }}
        disabled={formik.isSubmitting}
      >
        {formik.isSubmitting ? 'Registering...' : 'Register'}
      </Button>

      <Typography variant="body2" align="center">
        Already have an account?{' '}
        <Typography
          component="span"
          variant="body2"
          color="primary"
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/login')}
        >
          Login
        </Typography>
      </Typography>
    </Box>
  );
};

export default RegisterForm;