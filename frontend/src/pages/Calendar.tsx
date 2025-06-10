import React, { useState, useEffect, useRef, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput, DateSelectArg } from '@fullcalendar/core';
import { Box, Typography, Button, Alert, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../contexts/AuthContext';
import EventDialog from '../components/EventDialog';
import EventFilter, { EventFilters } from '../components/EventFilter';
import { fetchEvents, updateEventDates } from '../api/events';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { normalizeDate, toBackendDate } from '../utils/dateUtils';

const Calendar = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventInput | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState(false);
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    startDate: null,
    endDate: null,
    colors: [],
    showAllDay: true
  });
  const calendarRef = useRef<any>(null);

  // Fetch events
  const { data: apiResponse, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (apiResponse) {
      if (apiResponse.data && Array.isArray(apiResponse.data)) {
        setEvents(apiResponse.data);
        setErrorMsg(null);
      } else if (Array.isArray(apiResponse)) {
        setEvents(apiResponse);
        setErrorMsg(null);
      } else {
        setErrorMsg("Unexpected API response format.");
        setEvents([]);
      }
    } else {
      setEvents([]);
    }
  }, [apiResponse]);

  // Drag/drop event
  const updateEventMutation = useMutation({
    mutationFn: updateEventDates,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: () => {
      if (calendarRef.current) {
        calendarRef.current.getApi().refetchEvents();
      }
    }
  });

  const handleEventDrop = (info: any) => {
    updateEventMutation.mutate({
      id: info.event.id,
      start_datetime: toBackendDate(info.event.start),
      end_datetime: info.event.end ? toBackendDate(info.event.end) : null,
    });
  };

  const handleEventResize = (info: any) => {
    updateEventMutation.mutate({
      id: info.event.id,
      start_datetime: toBackendDate(info.event.start),
      end_datetime: toBackendDate(info.event.end),
    });
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedEvent({
      start: normalizeDate(selectInfo.start),
      end: normalizeDate(selectInfo.end),
      allDay: selectInfo.allDay,
    });
    setViewMode(false);
    setIsEventDialogOpen(true);
  };

  const handleDateClick = (arg: any) => {
    const clickedDate = normalizeDate(arg.date);
    const endDate = new Date(clickedDate.getTime() + 60 * 60 * 1000);
    setSelectedEvent({
      start: clickedDate,
      end: endDate,
      allDay: arg.allDay,
    });
    setViewMode(false);
    setIsEventDialogOpen(true);
  };

  const handleEventClick = (info: any) => {
    // Create the event data object, addressing the type issue
    const eventData: EventInput = {
      id: info.event.id,
      title: info.event.title,
      start: normalizeDate(info.event.start),
      allDay: info.event.allDay,
      backgroundColor: info.event.backgroundColor,
      borderColor: info.event.borderColor,
      extendedProps: info.event.extendedProps
    };

    // Only add end property if it exists or needs a default value
    if (info.event.end) {
      eventData.end = normalizeDate(info.event.end);
    } else if (!info.event.allDay) {
      // For timed events without end time, provide default (1 hour duration)
      eventData.end = new Date(info.event.start.getTime() + 60 * 60 * 1000);
    }
    // For all-day events without end time, omit the end property entirely

    setSelectedEvent(eventData);
    setViewMode(true);
    setIsEventDialogOpen(true);
  };

  const handleCloseEventDialog = () => {
    setIsEventDialogOpen(false);
    setSelectedEvent(null);
    setViewMode(false);
    queryClient.invalidateQueries({ queryKey: ['events'] });
  };

  const handleFilterChange = (newFilters: EventFilters) => {
    setFilters(newFilters);
  };

  // Apply filters to events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search filter
      if (filters.search && !event.title.toLowerCase().includes(filters.search.toLowerCase()) &&
          !(event.description && event.description.toLowerCase().includes(filters.search.toLowerCase()))) {
        return false;
      }

      // Date range filter
      if (filters.startDate) {
        const eventStart = new Date(event.start_datetime);
        if (eventStart < filters.startDate) {
          return false;
        }
      }

      if (filters.endDate) {
        const eventStart = new Date(event.start_datetime);
        // Set to end of day
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (eventStart > endDate) {
          return false;
        }
      }

      // Color filter
      if (filters.colors.length > 0 && !filters.colors.includes(event.color)) {
        return false;
      }

      // All-day filter
      return !(!filters.showAllDay && event.is_all_day);


    });
  }, [events, filters]);

  const formattedEvents = filteredEvents.map((event: any) => {
    // For formatted events, create the base event object
    const formattedEvent: any = {
      id: event.id,
      title: event.title,
      start: event.start_datetime,
      allDay: event.is_all_day,
      backgroundColor: event.color,
      borderColor: event.color,
      extendedProps: { description: event.description }
    };

    // Only add end property if it exists in the event data
    if (event.end_datetime) {
      formattedEvent.end = event.end_datetime;
    }

    return formattedEvent;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Calendar</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedEvent(null);
            setViewMode(false);
            setIsEventDialogOpen(true);
          }}
        >
          Add Event
        </Button>
      </Box>

      <EventFilter onFilterChange={handleFilterChange} />

      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

      {error && <Alert severity="error" sx={{ mb: 2 }}>Error loading events: {(error as Error).message}</Alert>}

      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        {isLoading ? (
          <Typography>Loading calendar...</Typography>
        ) : (
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={formattedEvents}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            select={handleDateSelect}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="auto"
            timeZone="local"
            displayEventTime={true}
            displayEventEnd={true}
          />
        )}
      </Paper>

      {isEventDialogOpen && (
        <EventDialog
          open={isEventDialogOpen}
          onClose={handleCloseEventDialog}
          event={selectedEvent}
          onViewMode={viewMode}
        />
      )}
    </Box>
  );
};

export default Calendar;