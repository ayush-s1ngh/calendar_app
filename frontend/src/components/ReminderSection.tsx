import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { fetchReminders, createReminder, deleteReminder } from '../api/reminders';
import { format } from 'date-fns';

// Import from @tanstack/react-query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ReminderSectionProps {
  eventId: number;
}

const ReminderSection = ({ eventId }: ReminderSectionProps) => {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [reminderTime, setReminderTime] = useState<Date | null>(new Date());

  // TanStack Query hooks
  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ['reminders', eventId],
    queryFn: () => fetchReminders(eventId),
    enabled: Boolean(eventId)
  });

  // Extract reminders from API response
  const reminders = apiResponse?.data || [];

  const createMutation = useMutation({
    mutationFn: createReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', eventId] });
      setIsAddDialogOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', eventId] });
    }
  });

  const handleAddReminder = () => {
    if (reminderTime) {
      createMutation.mutate({
        event_id: eventId,
        reminder_time: reminderTime.toISOString()
      });
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1">Reminders</Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setIsAddDialogOpen(true)}
        >
          Add Reminder
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : reminders.length > 0 ? (
        <List dense>
          {reminders.map((reminder: any) => (
            <ListItem key={reminder.id}>
              <ListItemText
                primary={`Reminder at ${format(new Date(reminder.reminder_time), 'MMM dd, yyyy h:mm a')}`}
                secondary={reminder.notification_sent ? 'Notification sent' : 'Pending'}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => deleteMutation.mutate(reminder.id)}
                  disabled={deleteMutation.isPending}
                  size="small"
                >
                  {deleteMutation.isPending ? <CircularProgress size={20} /> : <DeleteIcon />}
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">No reminders set</Typography>
      )}

      {/* Add Reminder Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
        <DialogTitle>Add Reminder</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Reminder Time"
                value={reminderTime}
                onChange={(newValue) => setReminderTime(newValue)}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleAddReminder}
            variant="contained"
            disabled={createMutation.isPending}
            startIcon={createMutation.isPending && <CircularProgress size={20} />}
          >
            Add Reminder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReminderSection;