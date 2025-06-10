import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { createTheme, Theme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { useAuth } from './AuthContext';
import { updateTheme as updateThemeApi } from '../api/auth';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { user, isAuthenticated, setUser } = useAuth();

  const [mode, setMode] = useState<ThemeMode>(() => {
    if (user?.theme_preference) {
      return user.theme_preference;
    }
    const storedTheme = localStorage.getItem('theme') as ThemeMode;
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
    return 'light';
  });

  const theme: Theme = createTheme({
    palette: {
      mode: mode,
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
  });

  useEffect(() => {
    localStorage.setItem('theme', mode);

    if (isAuthenticated && user && user.theme_preference !== mode) {
      console.log(`Attempting to update theme on backend to: ${mode}`);
      updateThemeApi(mode)
        .then(() => {
          console.log(`Backend theme updated to: ${mode}. Updating local user context.`);
          setUser({ ...user, theme_preference: mode });
        })
        .catch((error) => {
          console.error('Failed to update theme on backend:', error);
        });
    }
  }, [mode, isAuthenticated, user, setUser]);

  useEffect(() => {
    if (user?.theme_preference && user.theme_preference !== mode) {
      console.log(`User preference found: ${user.theme_preference}. Setting local mode.`);
      setMode(user.theme_preference);
    }
  }, [user, mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const value = {
    mode,
    toggleTheme,
    setMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {/* MuiThemeProvider wraps your app to apply Material-UI theme */}
      <MuiThemeProvider theme={theme}> {/* defaultMode is not a prop for MuiThemeProvider */}
        <CssBaseline /> {/* Resets CSS for consistent base styling */}
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};