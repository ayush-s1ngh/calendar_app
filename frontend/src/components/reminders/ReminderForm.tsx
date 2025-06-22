import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  CircularProgress
} from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { createReminder } from '../../api/reminders';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toBackendDate } from '../../utils/dateUtils';

interface ReminderFormProps {
  eventId: number;
  eventStartTime: Date;
}

const ReminderForm: React.FC<ReminderFormProps> = ({ eventId, eventStartTime }) => {
  const queryClient = useQueryClient();
  const [customTime, setCustomTime] = useState<Date | null>(() => {
    // Default to 15 minutes before event start
    const date = new Date(eventStartTime.getTime());
    date.setMinutes(date.getMinutes() - 15);
    return date;
  });
  const [timeOption, setTimeOption] = useState('15');
  const [customTimeSelected, setCustomTimeSelected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reminderMutation = useMutation({
    mutationFn: (reminderTime: Date) => createReminder(eventId, reminderTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', eventId] });
      // Reset form
      setTimeOption('15');
      setCustomTimeSelected(false);
      const date = new Date(eventStartTime.getTime());
      date.setMinutes(date.getMinutes() - 15);
      setCustomTime(date);
      setError(null);
    },
    onError: (err: any) => {
      console.error("Error creating reminder:", err);
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Error creating reminder';
      setError(errorMessage);
    }
  });

  const handleTimeOptionChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setTimeOption(value);
    setCustomTimeSelected(value === 'custom');
  };

  const handleSubmit = () => {
    try {
      // Calculate reminder time based on selection
      let reminderTime: Date;
      
      if (customTimeSelected && customTime) {
        reminderTime = new Date(customTime);
        
        // Check client-side if reminder time is before event time
        if (reminderTime >= eventStartTime) {
          setError('Reminder time must be before the event start time');
          return;
        }
      } else {
        // Calculate reminder time based on minutes before
        const minutesBefore = parseInt(timeOption);
        // Create a new date to avoid mutating eventStartTime
        reminderTime = new Date(eventStartTime.getTime() - minutesBefore * 60 * 1000);
      }
      
      // Log the dates for debugging
      console.log("Event start time:", eventStartTime);
      console.log("Event start ISO:", eventStartTime.toISOString());
      console.log("Reminder time:", reminderTime);
      console.log("Reminder ISO:", reminderTime.toISOString());
      
      reminderMutation.mutate(reminderTime);
    } catch (err: any) {
      setError(err?.message || 'Invalid reminder time');
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>Add Reminder</Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="reminder-time-label">Reminder</InputLabel>
          <Select
            labelId="reminder-time-label"
            id="reminder-time"
            value={timeOption}
            label="Reminder"
            onChange={handleTimeOptionChange}
          >
            <MenuItem value="5">5 minutes before</MenuItem>
            <MenuItem value="10">10 minutes before</MenuItem>
            <MenuItem value="15">15 minutes before</MenuItem>
            <MenuItem value="30">30 minutes before</MenuItem>
            <MenuItem value="60">1 hour before</MenuItem>
            <MenuItem value="120">2 hours before</MenuItem>
            <MenuItem value="1440">1 day before</MenuItem>
            <MenuItem value="custom">Custom time</MenuItem>
          </Select>
        </FormControl>
        
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={reminderMutation.isPending || (customTimeSelected && !customTime)}
        >
          {reminderMutation.isPending ? <CircularProgress size={24} /> : 'Add'}
        </Button>
      </Box>
      
      {customTimeSelected && (
        <Box sx={{ mt: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Custom Reminder Time"
              value={customTime}
              onChange={(newValue) => setCustomTime(newValue)}
              maxDateTime={new Date(eventStartTime.getTime() - 60000)} // At least 1 minute before
              slotProps={{
                textField: { size: 'small', fullWidth: true }
              }}
            />
          </LocalizationProvider>
        </Box>
      )}
    </Box>
  );
};

export default ReminderForm;