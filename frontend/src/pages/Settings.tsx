import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useThemeContext } from '../contexts/ThemeContext';

const Settings: React.FC = () => {
  const { mode, setMode } = useThemeContext();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Theme
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
      </Paper>
    </Box>
  );
};

export default Settings;