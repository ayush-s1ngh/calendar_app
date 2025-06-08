import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControlLabel, Checkbox, Box, CircularProgress
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { createEvent, updateEvent, deleteEvent, fetchEvent } from '../api/events';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { normalizeDate, toBackendDate, parseBackendDate } from '../utils/dateUtils'

interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  event: any | null;
}

const EventDialog = ({ open, onClose, event }: EventDialogProps) => {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(event && event.id);

  // Fetch full event details when editing an existing event
  const { data: fullEventData } = useQuery({
    queryKey: ['event', event?.id],
    queryFn: () => fetchEvent(event?.id),
    enabled: isEditMode && open,
  });

  const fullEvent = fullEventData?.data || null;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_datetime: normalizeDate(new Date()),
    end_datetime: normalizeDate(new Date(Date.now() + 60 * 60 * 1000)),
    is_all_day: false,
    color: 'blue'
  });

  useEffect(() => {
    if (isEditMode && fullEvent) {
      setFormData({
        title: fullEvent.title || '',
        description: fullEvent.description || '',
        start_datetime: parseBackendDate(fullEvent.start_datetime),
        end_datetime: parseBackendDate(fullEvent.end_datetime),
        is_all_day: fullEvent.is_all_day || false,
        color: fullEvent.color || 'blue'
      });
    } else if (event) {
      setFormData({
        title: event.title || '',
        description: event.extendedProps?.description || '',
        start_datetime: normalizeDate(event.start || new Date()),
        end_datetime: normalizeDate(event.end || new Date(Date.now() + 60 * 60 * 1000)),
        is_all_day: event.allDay || false,
        color: event.backgroundColor || 'blue'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        start_datetime: normalizeDate(new Date()),
        end_datetime: normalizeDate(new Date(Date.now() + 60 * 60 * 1000)),
        is_all_day: false,
        color: 'blue'
      });
    }
  }, [event, fullEvent, isEditMode]);

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      onClose();
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      onClose();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode) {
      updateMutation.mutate({
        id: event.id,
        ...formData,
        start_datetime: toBackendDate(formData.start_datetime),
        end_datetime: toBackendDate(formData.end_datetime),
      });
    } else {
      createMutation.mutate({
        ...formData,
        start_datetime: toBackendDate(formData.start_datetime),
        end_datetime: toBackendDate(formData.end_datetime),
      });
    }
  };

  const handleDelete = () => {
    if (isEditMode && event.id) {
      deleteMutation.mutate(event.id);
    }
  };

  const handleDateChange = (field: 'start_datetime' | 'end_datetime', newDate: Date | null) => {
    if (newDate) {
      setFormData((prev) => ({
        ...prev,
        [field]: normalizeDate(newDate)
      }));
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEditMode ? 'Edit Event' : 'Create Event'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              fullWidth
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.is_all_day}
                  onChange={(e) => setFormData({ ...formData, is_all_day: e.target.checked })}
                />
              }
              label="All Day Event"
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Start Date & Time"
                value={formData.start_datetime}
                onChange={(newValue) => handleDateChange('start_datetime', newValue)}
                disabled={isLoading}
              />
              {!formData.is_all_day && (
                <DateTimePicker
                  label="End Date & Time"
                  value={formData.end_datetime}
                  onChange={(newValue) => handleDateChange('end_datetime', newValue)}
                  disabled={isLoading}
                />
              )}
            </LocalizationProvider>
            {/* You can add ColorPicker and Reminders in later phases */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
          {isEditMode && (
            <Button color="error" onClick={handleDelete} disabled={isLoading}>
              Delete
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
          >
            {isEditMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EventDialog;