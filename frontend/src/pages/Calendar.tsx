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
import { normalizeDate, toBackendDate, fixDragOffset } from '../utils/dateUtils';

const Calendar = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventInput | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const calendarRef = useRef<any>(null);

  // Using TanStack Query's useQuery hook
  const { data: apiResponse, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    enabled: isAuthenticated,
  });

  // Process the API response in a useEffect to avoid render loop
  useEffect(() => {
    console.log("API Response:", apiResponse);

    if (apiResponse) {
      // Extract events from the API response structure
      if (apiResponse.data && Array.isArray(apiResponse.data)) {
        // Found events in the data property
        setEvents(apiResponse.data);
        setErrorMsg(null);
        console.log("Events found in data property, count:", apiResponse.data.length);
      } else if (Array.isArray(apiResponse)) {
        // Direct array response
        setEvents(apiResponse);
        setErrorMsg(null);
        console.log("Response is directly an array, length:", apiResponse.length);
      } else {
        // Unexpected format
        console.log("Response format not recognized:", apiResponse);
        setErrorMsg("Unexpected API response format. Please check console.");
        setEvents([]);
      }
    } else {
      setEvents([]);
    }
  }, [apiResponse]);

  // Using TanStack Query's useMutation hook
  const updateEventMutation = useMutation({
    mutationFn: updateEventDates,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      console.error("Error updating event dates:", error);
      // Force refresh the calendar to restore original positions
      if (calendarRef.current) {
        calendarRef.current.getApi().refetchEvents();
      }
    }
  });

  // Completely revised event drop handler to fix timezone issues
  const handleEventDrop = (info: any) => {
    const { event, oldEvent } = info;

    // Debug information
    console.log("=== EVENT DROP DEBUG ===");
    console.log("Event ID:", event.id);
    console.log("Original start:", oldEvent.start);
    console.log("Original end:", oldEvent.end);
    console.log("New start:", event.start);
    console.log("New end:", event.end);
    console.log("Delta days:", info.delta.days);
    console.log("Delta milliseconds:", info.delta.milliseconds);

    // This approach uses the delta value (how many days/time were moved)
    // rather than relying on the final date which might have timezone issues
    const originalStart = new Date(oldEvent.start);
    const originalEnd = oldEvent.end ? new Date(oldEvent.end) : null;

    // Calculate new dates based on the delta
    const newStart = new Date(originalStart);
    newStart.setDate(originalStart.getDate() + info.delta.days);
    newStart.setMilliseconds(originalStart.getMilliseconds() + info.delta.milliseconds);

    let newEnd = null;
    if (originalEnd) {
      newEnd = new Date(originalEnd);
      newEnd.setDate(originalEnd.getDate() + info.delta.days);
      newEnd.setMilliseconds(originalEnd.getMilliseconds() + info.delta.milliseconds);
    }

    // Debug the calculated dates
    console.log("Calculated new start:", newStart);
    console.log("Calculated new end:", newEnd);

    // Convert to ISO strings for the API
    const startIso = toBackendDate(newStart);
    const endIso = newEnd ? toBackendDate(newEnd) : null;

    console.log("Start ISO for API:", startIso);
    console.log("End ISO for API:", endIso);

    // Update the event
    updateEventMutation.mutate({
      id: event.id,
      start_datetime: startIso,
      end_datetime: endIso
    });
  };

  // Improved event resize handler
  const handleEventResize = (info: any) => {
    const { event, prevEvent } = info;

    // Debug information
    console.log("=== EVENT RESIZE DEBUG ===");
    console.log("Event ID:", event.id);
    console.log("Original start:", prevEvent.start);
    console.log("Original end:", prevEvent.end);
    console.log("New start:", event.start);
    console.log("New end:", event.end);
    console.log("Start unchanged:", event.start.getTime() === prevEvent.start.getTime());
    console.log("End difference (ms):", event.end.getTime() - prevEvent.end.getTime());

    // For resize, the start time doesn't change, only the end time
    // Convert to ISO strings for the API
    const startIso = toBackendDate(event.start);
    const endIso = toBackendDate(event.end);

    console.log("Start ISO for API:", startIso);
    console.log("End ISO for API:", endIso);

    // Update the event
    updateEventMutation.mutate({
      id: event.id,
      start_datetime: startIso,
      end_datetime: endIso
    });
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    console.log("Date selected:", selectInfo);
    setSelectedEvent({
      start: normalizeDate(selectInfo.start),
      end: normalizeDate(selectInfo.end),
      allDay: selectInfo.allDay
    });
    setIsEventDialogOpen(true);
  };

  const handleDateClick = (arg: any) => {
    console.log("Date clicked:", arg.date);
    const clickedDate = normalizeDate(arg.date);
    const endDate = new Date(clickedDate.getTime() + 60 * 60 * 1000); // 1 hour later

    setSelectedEvent({
      start: clickedDate,
      end: endDate,
      allDay: arg.allDay
    });
    setIsEventDialogOpen(true);
  };

  const handleEventClick = (info: any) => {
    console.log("Event clicked:", info.event);
    const eventStart = normalizeDate(info.event.start);
    const eventEnd = info.event.end ? normalizeDate(info.event.end) : new Date(eventStart.getTime() + 60 * 60 * 1000);

    setSelectedEvent({
      id: info.event.id,
      title: info.event.title,
      start: eventStart,
      end: eventEnd,
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
    // Refresh events when dialog closes
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
    extendedProps: {
      description: event.description
    }
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

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading events: {(error as Error).message}
        </Alert>
      )}

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
          timeZone="local" // Use local timezone
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