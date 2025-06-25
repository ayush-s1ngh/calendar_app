import React from 'react';
import { Backdrop, CircularProgress, Box, Typography } from '@mui/material';
import { createContext, useContext, useState, ReactNode } from 'react';

type LoadingContextType = {
  showLoading: (message?: string) => void;
  hideLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const showLoading = (msg?: string) => {
    setMessage(msg);
    setOpen(true);
  };

  const hideLoading = () => {
    setOpen(false);
  };

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      <Backdrop
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          color: '#fff',
          flexDirection: 'column',
        }}
        open={open}
      >
        <CircularProgress color="inherit" size={60} />
        {message && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" color="white">
              {message}
            </Typography>
          </Box>
        )}
      </Backdrop>
    </LoadingContext.Provider>
  );
};

// Default export is a simpler loading indicator for component-level use
const LoadingIndicator: React.FC<{ size?: number; message?: string }> = ({
  size = 40,
  message,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
      }}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingIndicator;