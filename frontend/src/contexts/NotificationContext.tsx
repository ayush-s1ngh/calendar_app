import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Notification } from '../types';
import { Snackbar, Alert, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: uuidv4(),
      duration: notification.duration || 6000, // Default 6 seconds
    };

    setNotifications(prev => [...prev, newNotification]);
  }, []);

  // Process notifications queue
  useEffect(() => {
    if (notifications.length > 0 && !currentNotification) {
      const nextNotification = notifications[0];
      setCurrentNotification(nextNotification);
      setOpen(true);
      // Remove from queue
      setNotifications(prev => prev.slice(1));
    }
  }, [notifications, currentNotification]);

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleExited = () => {
    setCurrentNotification(null);
  };

  const handleViewEvent = () => {
    if (currentNotification?.eventId) {
      navigate(`/calendar?event=${currentNotification.eventId}`);
      setOpen(false);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
      }}
    >
      {children}

      <Snackbar
        open={open}
        autoHideDuration={currentNotification?.duration}
        onClose={handleClose}
        TransitionProps={{ onExited: handleExited }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={currentNotification?.type || 'info'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          <Box>
            {currentNotification?.title && (
              <Typography variant="subtitle2">{currentNotification.title}</Typography>
            )}
            <Typography variant="body2">{currentNotification?.message}</Typography>
            {currentNotification?.eventId && (
              <Button
                size="small"
                color="inherit"
                onClick={handleViewEvent}
                sx={{ mt: 1 }}
              >
                View Event
              </Button>
            )}
          </Box>
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};