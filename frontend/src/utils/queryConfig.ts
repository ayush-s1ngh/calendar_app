import { DefaultOptions } from '@tanstack/react-query';

// Default query configurations
export const defaultQueryOptions: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - unused data is garbage collected after 10 minutes (formerly cacheTime)
  },
  mutations: {
    retry: 0, // Don't retry mutations by default
  },
};

// Cache keys for better organization and type safety
export const queryKeys = {
  events: {
    all: ['events'] as const,
    detail: (id: number) => ['events', id] as const,
    calendar: (year: number, month: number) => ['events', 'calendar', year, month] as const,
  },
  reminders: {
    byEvent: (eventId: number) => ['reminders', eventId] as const,
    detail: (id: number) => ['reminders', 'detail', id] as const,
  },
  user: {
    current: ['users', 'me'] as const,
    settings: ['users', 'settings'] as const,
  },
};

// Utility for handling API errors in queries and mutations
export const handleApiError = (error: any, fallbackMessage: string = 'An error occurred') => {
  // Try to extract the error message from the API response
  const errorMessage = error?.response?.data?.message || error?.message || fallbackMessage;
  console.error(errorMessage, error);
  return errorMessage;
};