import React, { useState, useEffect } from 'react';
import { Snackbar, Alert as MuiAlert, AlertProps, Typography } from '@mui/material';

interface NotificationAlertProps {
  open: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  onClose: () => void;
  autoHideDuration?: number;
}

const NotificationAlert: React.FC<NotificationAlertProps> = ({
  open,
  message,
  severity,
  onClose,
  autoHideDuration = 6000
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <MuiAlert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        <Typography variant="body2">{message}</Typography>
      </MuiAlert>
    </Snackbar>
  );
};

export default NotificationAlert;