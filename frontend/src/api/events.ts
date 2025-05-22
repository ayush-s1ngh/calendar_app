import apiClient from './client';
import { ApiResponse, Event, EventFormData } from '../types';

export const getEvents = async (): Promise<ApiResponse<Event[]>> => {
  const response = await apiClient.get<ApiResponse<Event[]>>('/events');
  return response.data;
};

export const getEvent = async (id: number): Promise<ApiResponse<Event>> => {
  const response = await apiClient.get<ApiResponse<Event>>(`/events/${id}`);
  return response.data;
};

export const createEvent = async (event: EventFormData): Promise<ApiResponse<Event>> => {
  const response = await apiClient.post<ApiResponse<Event>>('/events', event);
  return response.data;
};

export const updateEvent = async (id: number, event: Partial<EventFormData>): Promise<ApiResponse<Event>> => {
  const response = await apiClient.put<ApiResponse<Event>>(`/events/${id}`, event);
  return response.data;
};

export const deleteEvent = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`/events/${id}`);
  return response.data;
};

export const moveEvent = async (id: number, startDatetime: string, endDatetime?: string): Promise<ApiResponse<Event>> => {
  const response = await apiClient.put<ApiResponse<Event>>(`/events/${id}/move`, {
    start_datetime: startDatetime,
    end_datetime: endDatetime,
  });
  return response.data;
};