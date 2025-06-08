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
  const response = await apiClient.post('/events', {
    ...eventData,
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
  const response = await apiClient.put(`/events/${id}`, {
    ...eventData,
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
  const payload = {
    start_datetime: typeof start_datetime === 'string'
      ? start_datetime
      : toBackendDate(start_datetime),
    end_datetime: end_datetime
      ? (typeof end_datetime === 'string' ? end_datetime : toBackendDate(end_datetime))
      : null
  };
  const response = await apiClient.put(`/events/${id}/move`, payload);
  return response.data;
};