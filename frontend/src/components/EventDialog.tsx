import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControlLabel, Checkbox, Box,
  CircularProgress, Tabs, Tab, Typography, Alert
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { createEvent, updateEvent, deleteEvent, fetchEvent } from '../api/events';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { normalizeDate, toBackendDate, parseBackendDate } from '../utils/dateUtils';
import { useFormik } from 'formik';
import * as yup from 'yup';
import ColorPicker from './ColorPicker';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ReminderList from './reminders/ReminderList';

interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  event: any | null;
  onViewMode?: boolean;
}

// Define the form values interface to correctly type end_datetime as optional
interface EventFormValues {
  title: string;
  description: string;
  start_datetime: Date;
  end_datetime: Date | null;
  is_all_day: boolean;
  color: string;
}

// Define validation schema using Yup
const validationSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .max(128, 'Title must be at most 128 characters'),
  start_datetime: yup
    .date()
    .required('Start date/time is required'),
  end_datetime: yup
    .date()
    .nullable()
    .test(
      'is-after-start',
      'End time must be after start time',
      function (value) {
        const { start_datetime, is_all_day } = this.parent;
        if (is_all_day || !value) return true;
        return value > start_datetime;
      }
    ),
});

const EventDialog = ({ open, onClose, event, onViewMode = false }: EventDialogProps) => {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(event && event.id);
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState(onViewMode);

  // Fetch full event details when editing an existing event
  const { data: fullEventData, isLoading: isLoadingEvent } = useQuery({
    queryKey: ['event', event?.id],
    queryFn: () => fetchEvent(event?.id),
    enabled: isEditMode && open,
  });

  const fullEvent = fullEventData?.data || null;

  // Define formik with properly typed initialValues
  const formik = useFormik<EventFormValues>({
    initialValues: {
      title: '',
      description: '',
      start_datetime: normalizeDate(new Date()),
      end_datetime: normalizeDate(new Date(Date.now() + 60 * 60 * 1000)),
      is_all_day: false,
      color: 'blue' // Default color
    },
    validationSchema,
    onSubmit: (values) => {
      if (isEditMode) {
        updateMutation.mutate({
          id: event.id,
          ...values,
          start_datetime: toBackendDate(values.start_datetime),
          end_datetime: values.end_datetime ? toBackendDate(values.end_datetime) : null,
        });
      } else {
        createMutation.mutate({
          ...values,
          start_datetime: toBackendDate(values.start_datetime),
          end_datetime: values.end_datetime ? toBackendDate(values.end_datetime) : null,
        });
      }
    },
  });

  useEffect(() => {
    // Reset view mode based on prop
    setViewMode(onViewMode);
    setActiveTab(0); // Reset activeTab when event changes

    if (isEditMode && fullEvent) {
      formik.resetForm({
        values: {
          title: fullEvent.title || '',
          description: fullEvent.description || '',
          start_datetime: parseBackendDate(fullEvent.start_datetime),
          // Correctly handle null end_datetime
          end_datetime: fullEvent.end_datetime ? parseBackendDate(fullEvent.end_datetime) : null,
          is_all_day: fullEvent.is_all_day || false,
          color: fullEvent.color || 'blue'
        }
      });
    } else if (event) {
      formik.resetForm({
        values: {
          title: event.title || '',
          description: event.extendedProps?.description || '',
          start_datetime: normalizeDate(event.start || new Date()),
          end_datetime: event.end ? normalizeDate(event.end) : null,
          is_all_day: event.allDay || false,
          color: event.backgroundColor || 'blue'
        }
      });
    } else {
      formik.resetForm({
        values: {
          title: '',
          description: '',
          start_datetime: normalizeDate(new Date()),
          end_datetime: normalizeDate(new Date(Date.now() + 60 * 60 * 1000)),
          is_all_day: false,
          color: 'blue'
        }
      });
    }
  }, [event, fullEvent, isEditMode, onViewMode]);

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

  const handleDelete = () => {
    if (isEditMode && event.id) {
      deleteMutation.mutate(event.id);
    }
  };

  const handleDateChange = (field: 'start_datetime' | 'end_datetime', newDate: Date | null) => {
    formik.setFieldValue(field, newDate);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // If switching to edit tab, turn off view mode
    if (newValue === 1) {
      setViewMode(false);
    }
  };

  // Function to handle the "Edit Event" button click in view mode
  const handleEditClick = () => {
    setViewMode(false);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || isLoadingEvent;
  const hasError = createMutation.isError || updateMutation.isError || deleteMutation.isError;
  const errorMessage = createMutation.error || updateMutation.error || deleteMutation.error;

  const showRemindersTab = isEditMode && fullEvent?.id;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {viewMode ? 'Event Details' : isEditMode ? 'Edit Event' : 'Create Event'}
      </DialogTitle>

      {isEditMode && !viewMode && (
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Details" />
          <Tab label="Edit" />
          {showRemindersTab && (
            <Tab
              label="Reminders"
              icon={<NotificationsIcon />}
              iconPosition="start"
            />
          )}
        </Tabs>
      )}

      <DialogContent>
        {hasError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage instanceof Error ? errorMessage.message : 'An error occurred'}
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* View Mode */}
            {viewMode ? (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h5" gutterBottom>{formik.values.title}</Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        bgcolor: formik.values.color,
                        mr: 1
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {formik.values.is_all_day ? 'All day event' : 'Timed event'}
                    </Typography>
                  </Box>

                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                    Date & Time:
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {formik.values.start_datetime.toLocaleDateString()}
                    {!formik.values.is_all_day && formik.values.start_datetime.toLocaleTimeString()}
                    {formik.values.end_datetime && !formik.values.is_all_day && (
                      <> to {formik.values.end_datetime.toLocaleDateString()} {formik.values.end_datetime.toLocaleTimeString()}</>
                    )}
                  </Typography>

                  {formik.values.description && (
                    <>
                      <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                        Description:
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {formik.values.description}
                      </Typography>
                    </>
                  )}
                </Box>
              </>
            ) : isEditMode && activeTab === 0 ? (
              // Details tab in edit mode
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h5" gutterBottom>{formik.values.title}</Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        bgcolor: formik.values.color,
                        mr: 1
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {formik.values.is_all_day ? 'All day event' : 'Timed event'}
                    </Typography>
                  </Box>

                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                    Date & Time:
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {formik.values.start_datetime.toLocaleDateString()}
                    {!formik.values.is_all_day && formik.values.start_datetime.toLocaleTimeString()}
                    {formik.values.end_datetime && !formik.values.is_all_day && (
                      <> to {formik.values.end_datetime.toLocaleDateString()} {formik.values.end_datetime.toLocaleTimeString()}</>
                    )}
                  </Typography>

                  {formik.values.description && (
                    <>
                      <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                        Description:
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {formik.values.description}
                      </Typography>
                    </>
                  )}
                </Box>
                <Button
                  variant="outlined"
                  onClick={() => setActiveTab(1)}
                  sx={{ alignSelf: 'flex-start', mt: 2 }}
                >
                  Edit Event
                </Button>
              </>
            ) : isEditMode && activeTab === 2 && showRemindersTab ? (
              // Reminders tab
              <Box sx={{ mt: 1 }}>
                {fullEvent && (
                  <ReminderList
                    eventId={fullEvent.id}
                    eventStartDateTime={fullEvent.start_datetime}
                  />
                )}
              </Box>
            ) : (
              // Edit Mode Form (either new event or edit tab)
              <form onSubmit={formik.handleSubmit}>
                <TextField
                  label="Title"
                  fullWidth
                  required
                  id="title"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                  sx={{ mb: 2 }}
                  disabled={isLoading}
                />

                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  id="description"
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  sx={{ mb: 2 }}
                  disabled={isLoading}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.is_all_day}
                      onChange={(e) => formik.setFieldValue('is_all_day', e.target.checked)}
                      name="is_all_day"
                      disabled={isLoading}
                    />
                  }
                  label="All Day Event"
                  sx={{ mb: 2 }}
                />

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Start Date & Time"
                    value={formik.values.start_datetime}
                    onChange={(newValue) => handleDateChange('start_datetime', newValue)}
                    disabled={isLoading}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        margin: 'normal',
                        error: formik.touched.start_datetime && Boolean(formik.errors.start_datetime),
                        helperText: formik.touched.start_datetime && formik.errors.start_datetime as string
                      }
                    }}
                  />

                  {!formik.values.is_all_day && (
                    <DateTimePicker
                      label="End Date & Time"
                      value={formik.values.end_datetime}
                      onChange={(newValue) => handleDateChange('end_datetime', newValue)}
                      disabled={isLoading}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          margin: 'normal',
                          error: formik.touched.end_datetime && Boolean(formik.errors.end_datetime),
                          helperText: formik.touched.end_datetime && formik.errors.end_datetime as string
                        }
                      }}
                    />
                  )}
                </LocalizationProvider>

                <Box sx={{ mt: 2 }}>
                  <ColorPicker
                    selectedColor={formik.values.color}
                    onColorChange={(color) => formik.setFieldValue('color', color)}
                  />
                </Box>
              </form>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          {viewMode ? 'Close' : 'Cancel'}
        </Button>

        {isEditMode && !viewMode && activeTab === 1 && (
          <Button color="error" onClick={handleDelete} disabled={isLoading}>
            Delete
          </Button>
        )}

        {!viewMode && (isEditMode ? activeTab === 1 : true) && (
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            onClick={() => formik.handleSubmit()}
          >
            {isLoading ? (
              <CircularProgress size={24} />
            ) : isEditMode ? 'Update' : 'Create'}
          </Button>
        )}

        {viewMode && isEditMode && (
          <Button
            color="primary"
            variant="contained"
            onClick={handleEditClick}
          >
            Edit
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EventDialog;