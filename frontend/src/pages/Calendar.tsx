import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput, DateSelectArg } from '@fullcalendar/core';
import { Box, Typography, Button, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../contexts/AuthContext';
import EventDialog from '../components/EventDialog';
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
    setIsEventDialogOpen(true);
  };

  const handleEventClick = (info: any) => {
    setSelectedEvent({
      id: info.event.id,
      title: info.event.title,
      start: normalizeDate(info.event.start),
      end: info.event.end ? normalizeDate(info.event.end) : new Date(info.event.start.getTime() + 60 * 60 * 1000),
      allDay: info.event.allDay,
      backgroundColor: info.event.backgroundColor,
      borderColor: info.event.borderColor,
      extendedProps: info.event.extendedProps
    });
    setIsEventDialogOpen(true);
  };

  const handleCloseEventDialog = () => {
    setIsEventDialogOpen(false);
    setSelectedEvent(null);
    queryClient.invalidateQueries({ queryKey: ['events'] });
  };

  const formattedEvents = events.map((event: any) => ({
    id: event.id,
    title: event.title,
    start: event.start_datetime,
    end: event.end_datetime,
    allDay: event.is_all_day,
    backgroundColor: event.color,
    borderColor: event.color,
    extendedProps: { description: event.description }
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Calendar</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedEvent(null);
            setIsEventDialogOpen(true);
          }}
        >
          Add Event
        </Button>
      </Box>

      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

      {error && <Alert severity="error" sx={{ mb: 2 }}>Error loading events: {(error as Error).message}</Alert>}

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

      {isEventDialogOpen && (
        <EventDialog
          open={isEventDialogOpen}
          onClose={handleCloseEventDialog}
          event={selectedEvent}
        />
      )}
    </Box>
  );
};

export default Calendar;