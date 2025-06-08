import apiClient from './client';
import { toBackendDate } from '../utils/dateUtils';

export const fetchEvents = async () => {
  const response = await apiClient.get('/events');
  return response.data;
};

export const fetchEvent = async (id: number) => {
  const response = await apiClient.get(`/events/${id}`);
  return response.data;
};

export const createEvent = async (eventData: any) => {
  // Ensure dates are properly formatted for the backend
  console.log("Creating event with data:", eventData);

  const response = await apiClient.post('/events', {
    ...eventData,
    // These should already be ISO strings from toBackendDate, but double-check
    start_datetime: typeof eventData.start_datetime === 'string'
      ? eventData.start_datetime
      : toBackendDate(eventData.start_datetime),
    end_datetime: typeof eventData.end_datetime === 'string'
      ? eventData.end_datetime
      : toBackendDate(eventData.end_datetime)
  });

  return response.data;
};

export const updateEvent = async ({ id, ...eventData }: any) => {
  // Ensure dates are properly formatted for the backend
  console.log(`Updating event ${id} with data:`, eventData);

  const response = await apiClient.put(`/events/${id}`, {
    ...eventData,
    // These should already be ISO strings from toBackendDate, but double-check
    start_datetime: typeof eventData.start_datetime === 'string'
      ? eventData.start_datetime
      : toBackendDate(eventData.start_datetime),
    end_datetime: typeof eventData.end_datetime === 'string'
      ? eventData.end_datetime
      : toBackendDate(eventData.end_datetime)
  });

  return response.data;
};

export const deleteEvent = async (id: number) => {
  const response = await apiClient.delete(`/events/${id}`);
  return response.data;
};

export const updateEventDates = async ({ id, start_datetime, end_datetime }: any) => {
  console.log(`Updating event ${id} dates:`, { start_datetime, end_datetime });

  // Make sure we're sending proper date strings
  const payload = {
    start_datetime: typeof start_datetime === 'string'
      ? start_datetime
      : toBackendDate(start_datetime),
    end_datetime: end_datetime
      ? (typeof end_datetime === 'string' ? end_datetime : toBackendDate(end_datetime))
      : null
  };

  console.log("API payload for date update:", payload);

  const response = await apiClient.put(`/events/${id}/move`, payload);
  return response.data;
};