import React, { useState, useEffect } from 'react';
import { Box, Typography, Divider, CircularProgress, Alert } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReminders, deleteReminder } from '../../api/reminders';
import ReminderItem from './ReminderItem';
import ReminderForm from './ReminderForm';
import { parseBackendDate } from '../../utils/dateUtils';

interface ReminderListProps {
  eventId: number;
  eventStartDateTime: string;  // Keep this as is to match what EventDialog is passing
}

const ReminderList: React.FC<ReminderListProps> = ({ eventId, eventStartDateTime }) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const eventStartTime = parseBackendDate(eventStartDateTime);

  // Fetch reminders for the event
  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['reminders', eventId],
    queryFn: () => fetchReminders(eventId),
    enabled: !!eventId, // Only run if eventId is provided
  });

  // Use useEffect to handle errors from the query
  useEffect(() => {
    if (isError && queryError) {
      console.error("Error in reminders query:", queryError);
      const errorMessage =
        queryError instanceof Error ? queryError.message :
        "Failed to load reminders";
      setError(errorMessage);
    } else {
      setError(null);
    }
  }, [isError, queryError]);

  // Delete reminder mutation
  const deleteMutation = useMutation({
    mutationFn: deleteReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', eventId] });
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to delete reminder");
    }
  });

  const handleDeleteReminder = (reminderId: number) => {
    deleteMutation.mutate(reminderId);
  };

  // Extract reminders safely from the correct API response structure
  const reminders = data?.data || [];
  const isDeleting = deleteMutation.isPending;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>Reminders</Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {reminders.length > 0 ? (
        <Box sx={{ mb: 3 }}>
          {reminders.map((reminder: any) => (
            <ReminderItem
              key={reminder.id}
              reminder={reminder}
              onDelete={handleDeleteReminder}
              eventStartTime={eventStartTime}
            />
          ))}
        </Box>
      ) : (
        !isError && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No reminders set for this event
          </Typography>
        )
      )}

      <Divider sx={{ my: 2 }} />

      {/* Pass eventStartTime to ReminderForm */}
      <ReminderForm eventId={eventId} eventStartTime={eventStartTime} />

      {isDeleting && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
};

export default ReminderList;