import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Divider,
  useTheme,
  IconButton,
  Stack,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import { useThemeContext } from '../contexts/ThemeContext';

const Settings: React.FC = () => {
  const { mode, setMode } = useThemeContext();
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Appearance
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Stack spacing={3} direction={{ xs: 'column', md: 'row' }} sx={{ mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Theme Mode
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Card
                variant="outlined"
                sx={{
                  flex: 1,
                  cursor: 'pointer',
                  borderColor: mode === 'light' ? theme.palette.primary.main : 'divider',
                  transform: mode === 'light' ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                  boxShadow: mode === 'light' ? 2 : 0,
                }}
                onClick={() => setMode('light')}
              >
                <CardContent sx={{
                  textAlign: 'center',
                  bgcolor: '#ffffff',
                  color: '#333333',
                  p: 2
                }}>
                  <IconButton sx={{ color: '#1976d2', mb: 1 }}>
                    <LightModeIcon fontSize="large" />
                  </IconButton>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Light
                  </Typography>
                </CardContent>
              </Card>

              <Card
                variant="outlined"
                sx={{
                  flex: 1,
                  cursor: 'pointer',
                  borderColor: mode === 'dark' ? theme.palette.primary.main : 'divider',
                  transform: mode === 'dark' ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                  boxShadow: mode === 'dark' ? 2 : 0,
                }}
                onClick={() => setMode('dark')}
              >
                <CardContent sx={{
                  textAlign: 'center',
                  bgcolor: '#1e1e1e',
                  color: '#ffffff',
                  p: 2
                }}>
                  <IconButton sx={{ color: '#90caf9', mb: 1 }}>
                    <DarkModeIcon fontSize="large" />
                  </IconButton>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Dark
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Quick Toggle
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={mode === 'dark'}
                  onChange={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                  color="primary"
                />
              }
              label="Dark Mode"
            />

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Changing the theme will update your preference across all your devices when you're logged in.
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Settings;