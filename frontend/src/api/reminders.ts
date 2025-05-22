import apiClient from './client';
import { ApiResponse, Reminder } from '../types';

export const getEventReminders = async (eventId: number): Promise<ApiResponse<Reminder[]>> => {
  const response = await apiClient.get<ApiResponse<Reminder[]>>(`/reminders/event/${eventId}/reminders`);
  return response.data;
};

export const createReminder = async (eventId: number, reminderTime: string): Promise<ApiResponse<Reminder>> => {
  const response = await apiClient.post<ApiResponse<Reminder>>(`/reminders/event/${eventId}/reminders`, {
    reminder_time: reminderTime,
  });
  return response.data;
};

export const deleteReminder = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`/reminders/${id}`);
  return response.data;
};