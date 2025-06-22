import React from 'react';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { parseBackendDate } from '../../utils/dateUtils';

interface ReminderItemProps {
  reminder: any;
  onDelete: (reminderId: number) => void;
  eventStartTime: Date;
}

const ReminderItem: React.FC<ReminderItemProps> = ({ reminder, onDelete, eventStartTime }) => {
  const reminderTime = parseBackendDate(reminder.reminder_time);

  // Calculate time before event
  const timeDiff = eventStartTime.getTime() - reminderTime.getTime();
  const minutesBefore = Math.floor(timeDiff / (1000 * 60));

  let timeBeforeText = '';
  if (minutesBefore >= 1440) {
    // Days
    timeBeforeText = `${Math.floor(minutesBefore / 1440)} days before`;
  } else if (minutesBefore >= 60) {
    // Hours
    timeBeforeText = `${Math.floor(minutesBefore / 60)} hours before`;
  } else {
    // Minutes
    timeBeforeText = `${minutesBefore} minutes before`;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1,
        borderRadius: 1,
        mb: 1,
        bgcolor: 'background.paper',
        boxShadow: 1
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Box>
          <Typography variant="body2">
            {reminderTime.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {timeBeforeText}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {reminder.notification_sent && (
          <Chip
            icon={<CheckCircleIcon fontSize="small" />}
            label="Sent"
            size="small"
            color="success"
            sx={{ mr: 1 }}
          />
        )}
        <IconButton
          size="small"
          color="error"
          onClick={() => onDelete(reminder.id)}
          aria-label="Delete reminder"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ReminderItem;