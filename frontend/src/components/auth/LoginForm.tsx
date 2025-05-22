import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { login } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const validationSchema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
});

const LoginForm: React.FC = () => {
  const [error, setError] = React.useState<string | null>(null);
  const { setAuthTokens, setUser } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await login(values);
        if (response.success && response.data) {
          setAuthTokens(response.data.tokens);
          setUser(response.data.user);
          navigate('/calendar');
        } else {
          setError(response.message || 'Login failed');
        }
      } catch (error: any) {
        setError(error.response?.data?.message || 'An error occurred during login');
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
        label="Username or Email"
        margin="normal"
        variant="outlined"
        value={formik.values.username}
        onChange={formik.handleChange}
        error={formik.touched.username && Boolean(formik.errors.username)}
        helperText={formik.touched.username && formik.errors.username}
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

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        sx={{ mt: 3, mb: 2 }}
        disabled={formik.isSubmitting}
      >
        {formik.isSubmitting ? 'Logging in...' : 'Login'}
      </Button>

      <Typography variant="body2" align="center">
        Don't have an account?{' '}
        <Typography
          component="span"
          variant="body2"
          color="primary"
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/register')}
        >
          Register
        </Typography>
      </Typography>
    </Box>
  );
};

export default LoginForm;