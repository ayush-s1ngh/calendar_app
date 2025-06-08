import apiClient from './client';

export const fetchReminders = async (eventId: number) => {
  const response = await apiClient.get(`/events/${eventId}/reminders`);
  return response.data;
};

export const createReminder = async (data: { event_id: number, reminder_time: string }) => {
  const response = await apiClient.post(`/events/${data.event_id}/reminders`, {
    reminder_time: data.reminder_time
  });
  return response.data;
};

export const deleteReminder = async (id: number) => {
  const response = await apiClient.delete(`/reminders/${id}`);
  return response.data;
};