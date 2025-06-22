import apiClient from './client';
import { toBackendDate } from '../utils/dateUtils';

// Get reminders for an event - FIXED URL
export const fetchReminders = async (eventId: number) => {
  try {
    const response = await apiClient.get(`/reminders/event/${eventId}/reminders`);
    return response.data;
  } catch (error) {
    console.error("Error fetching reminders:", error);
    throw error;
  }
};

// Create a new reminder for an event - FIXED URL
export const createReminder = async (eventId: number, reminderTime: Date) => {
  try {
    const payload = {
      reminder_time: toBackendDate(reminderTime)
    };

    const response = await apiClient.post(
      `/reminders/event/${eventId}/reminders`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error creating reminder:", error);
    throw error;
  }
};

// Delete a reminder
export const deleteReminder = async (reminderId: number) => {
  try {
    const response = await apiClient.delete(`/reminders/${reminderId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting reminder:", error);
    throw error;
  }
};