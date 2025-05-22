import React, { useState } from 'react';
import { Box, Paper, Typography, CircularProgress, Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Add as AddIcon } from '@mui/icons-material';
import { getEvents } from '../api/events';
import { Event as CalendarEvent } from '../types';

const Calendar: React.FC = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await getEvents();
      if (!response.success) {
        throw new Error(response.message || 'Failed to load events');
      }
      return response.data || [];
    }
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{(error as Error).message}</Typography>
        <Button variant="outlined" onClick={() => refetch()} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Calendar
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => console.log('Add event')}
        >
          Add Event
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="body1">
          {data?.length
            ? `You have ${data.length} events`
            : 'No events scheduled. Click "Add Event" to create one.'}
        </Typography>

        {/* We'll add FullCalendar in the next step */}
      </Paper>
    </Box>
  );
};

export default Calendar;