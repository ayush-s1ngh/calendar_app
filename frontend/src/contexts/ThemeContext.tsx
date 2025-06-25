import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { createTheme, Theme, responsiveFontSizes } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { useAuth } from './AuthContext';
import { updateTheme as updateThemeApi } from '../api/auth';
import { debounce } from 'lodash';

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

  // Initialize theme from user preference or localStorage
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (user?.theme_preference === 'light' || user?.theme_preference === 'dark') {
      return user.theme_preference;
    }

    const storedTheme = localStorage.getItem('theme') as ThemeMode;
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }

    return 'light'; // Default
  });

  // Track if the theme was just loaded from user preferences
  const [initialUserThemeLoaded, setInitialUserThemeLoaded] = useState(false);

  // Track if we need to sync with backend
  const [needsBackendSync, setNeedsBackendSync] = useState(false);

  // Create a debounced function for API calls to prevent rapid firing
  const debouncedUpdateBackendTheme = useCallback(
    debounce((newMode: ThemeMode) => {
      if (!isAuthenticated) return;

      console.log(`Syncing theme with backend: ${newMode}`);
      updateThemeApi(newMode)
        .then((response) => {
          if (response.success && user) {
            console.log('Theme successfully updated on backend');
            setUser({ ...user, theme_preference: newMode });
          }
        })
        .catch((error) => {
          console.error('Failed to update theme on backend:', error);
        });
    }, 500), // 500ms debounce to prevent rapid API calls
    [isAuthenticated, user, setUser]
  );

  // Create and memoize the theme object
  const theme: Theme = useMemo(() => {
    // Base theme
    let generatedTheme = createTheme({
      palette: {
        mode: mode,
        primary: {
          main: '#1976d2',
          light: '#42a5f5',
          dark: '#1565c0',
        },
        secondary: {
          main: '#dc004e',
          light: '#ff4081',
          dark: '#9a0036',
        },
        background: {
          default: mode === 'light' ? '#f5f5f5' : '#121212',
          paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
        },
        error: {
          main: '#f44336',
        },
        warning: {
          main: '#ff9800',
        },
        info: {
          main: '#2196f3',
        },
        success: {
          main: '#4caf50',
        },
        text: {
          primary: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
          secondary: mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
        },
      },
      typography: {
        fontFamily: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ].join(','),
        h1: {
          fontWeight: 500,
        },
        h2: {
          fontWeight: 500,
        },
        h3: {
          fontWeight: 500,
        },
        h4: {
          fontWeight: 500,
        },
        h5: {
          fontWeight: 500,
        },
        h6: {
          fontWeight: 500,
        },
      },
      shape: {
        borderRadius: 8,
      },
      spacing: 8,
      // Do NOT modify the shadows array directly - instead, use theme overrides for specific components
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              transition: 'background-color 0.3s ease, color 0.3s ease',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
              ...(mode === 'dark' && {
                boxShadow: '0px 2px 8px -1px rgba(0,0,0,0.3),0px 4px 15px 0px rgba(0,0,0,0.24)',
              }),
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              transition: 'background-color 0.3s ease, transform 0.2s ease, border-color 0.2s ease',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              boxShadow: mode === 'dark'
                ? '0px 2px 10px -1px rgba(0,0,0,0.4)'
                : undefined, // Use default for light mode
            },
          },
        },
      },
    });

    // Add responsive font sizes
    generatedTheme = responsiveFontSizes(generatedTheme);

    return generatedTheme;
  }, [mode]);

  // Handle theme toggle
  const toggleTheme = useCallback(() => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newMode);
      setNeedsBackendSync(true);
      return newMode;
    });
  }, []);

  // Handle explicit theme setting
  const setThemeMode = useCallback((newMode: ThemeMode) => {
    if (newMode !== mode) {
      setMode(newMode);
      localStorage.setItem('theme', newMode);
      setNeedsBackendSync(true);
    }
  }, [mode]);

  // Effect for syncing with backend when needed
  useEffect(() => {
    if (needsBackendSync && isAuthenticated) {
      debouncedUpdateBackendTheme(mode);
      setNeedsBackendSync(false);
    }
  }, [needsBackendSync, isAuthenticated, mode, debouncedUpdateBackendTheme]);

  // Effect to handle user preference changes (first load only)
  useEffect(() => {
    if (user?.theme_preference && !initialUserThemeLoaded) {
      if (user.theme_preference !== mode) {
        console.log(`Loading user theme preference: ${user.theme_preference}`);
        setMode(user.theme_preference);
        localStorage.setItem('theme', user.theme_preference);
      }
      setInitialUserThemeLoaded(true);
    }
  }, [user, mode, initialUserThemeLoaded]);

  // External API for theme context
  const contextValue = useMemo(() => ({
    mode,
    toggleTheme,
    setMode: setThemeMode,
  }), [mode, toggleTheme, setThemeMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};