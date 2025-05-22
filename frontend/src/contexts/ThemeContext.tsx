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
  const { user, isAuthenticated } = useAuth();
  const [mode, setMode] = useState<ThemeMode>(
    user?.theme_preference || (localStorage.getItem('theme') as ThemeMode) || 'light'
  );

  // Create theme
  const theme: Theme = createTheme({
    colorSchemes: {
      light: {
        palette: {
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          },
        },
      },
      dark: {
        palette: {
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
        },
      },
    },
  });

  useEffect(() => {
    // Update localStorage theme
    localStorage.setItem('theme', mode);

    // Update theme in backend if authenticated
    if (isAuthenticated && user) {
      updateThemeApi(mode).catch(console.error);
    }
  }, [mode, isAuthenticated, user]);

  // Set theme from user preferences when user data is loaded
  useEffect(() => {
    if (user?.theme_preference) {
      setMode(user.theme_preference);
    }
  }, [user]);

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
      <MuiThemeProvider theme={theme} defaultMode={mode}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};