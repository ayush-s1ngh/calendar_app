import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEvent, updateEvent, deleteEvent } from '../api/events';
import { queryKeys } from '../utils/queryConfig';
import { useNotifications } from '../contexts/NotificationContext';

// Hook for optimistic CRUD operations on events
export const useOptimisticEvents = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  // Helper to get current events from cache
  const getEventsFromCache = () => {
    return queryClient.getQueryData(queryKeys.events.all) || { data: [] };
  };

  // Create event with optimistic update
  const createEventMutation = useMutation({
    mutationFn: createEvent,
    onMutate: async (newEvent) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.events.all });

      // Snapshot the previous value
      const previousEvents = getEventsFromCache();

      // Create a temporary ID for the optimistic update
      const tempId = `temp-${Date.now()}`;

      // Create optimistic event
      const optimisticEvent = {
        ...newEvent,
        id: tempId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Optimistically update the cache
      queryClient.setQueryData(queryKeys.events.all, (old: any) => {
        const data = old?.data || [];
        return { ...old, data: [...data, optimisticEvent] };
      });

      return { previousEvents, tempId };
    },
    onSuccess: (result, variables, context) => {
      // Invalidate and refetch to get the real data
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });

      addNotification({
        type: 'success',
        message: 'Event created successfully',
        title: 'Success',
      });
    },
    onError: (error, variables, context) => {
      // Rollback to the previous state on error
      if (context?.previousEvents) {
        queryClient.setQueryData(queryKeys.events.all, context.previousEvents);
      }

      addNotification({
        type: 'error',
        message: 'Failed to create event: ' + (error instanceof Error ? error.message : 'Unknown error'),
        title: 'Error',
      });
    },
  });

  // Update event with optimistic update
  const updateEventMutation = useMutation({
    mutationFn: updateEvent,
    onMutate: async (updatedEvent) => {
      const { id } = updatedEvent;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.events.all });
      await queryClient.cancelQueries({ queryKey: queryKeys.events.detail(id) });

      // Snapshot the previous values
      const previousEvents = getEventsFromCache();
      const previousEvent = queryClient.getQueryData(queryKeys.events.detail(id));

      // Optimistically update the cache
      queryClient.setQueryData(queryKeys.events.all, (old: any) => {
        const data = old?.data || [];
        return {
          ...old,
          data: data.map((event: any) =>
            event.id === id ? { ...event, ...updatedEvent, updated_at: new Date().toISOString() } : event
          ),
        };
      });

      // Also update the detail cache if it exists
      if (previousEvent) {
        queryClient.setQueryData(queryKeys.events.detail(id), (old: any) => ({
          ...old,
          data: { ...old.data, ...updatedEvent, updated_at: new Date().toISOString() },
        }));
      }

      return { previousEvents, previousEvent };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });

      addNotification({
        type: 'success',
        message: 'Event updated successfully',
        title: 'Success',
      });
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousEvents) {
        queryClient.setQueryData(queryKeys.events.all, context.previousEvents);
      }

      if (context?.previousEvent) {
        queryClient.setQueryData(
          queryKeys.events.detail(variables.id),
          context.previousEvent
        );
      }

      addNotification({
        type: 'error',
        message: 'Failed to update event: ' + (error instanceof Error ? error.message : 'Unknown error'),
        title: 'Error',
      });
    },
  });

  // Delete event with optimistic update
  const deleteEventMutation = useMutation({
    mutationFn: deleteEvent,
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.events.all });

      // Snapshot the previous value
      const previousEvents = getEventsFromCache();

      // Optimistically remove from the cache
      queryClient.setQueryData(queryKeys.events.all, (old: any) => {
        const data = old?.data || [];
        return {
          ...old,
          data: data.filter((event: any) => event.id !== id),
        };
      });

      // Remove from the detail cache
      queryClient.removeQueries({ queryKey: queryKeys.events.detail(id) });

      return { previousEvents };
    },
    onSuccess: (data, id) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      queryClient.removeQueries({ queryKey: queryKeys.events.detail(id) });
      queryClient.removeQueries({ queryKey: queryKeys.reminders.byEvent(id) });

      addNotification({
        type: 'success',
        message: 'Event deleted successfully',
        title: 'Success',
      });
    },
    onError: (error, id, context) => {
      // Rollback on error
      if (context?.previousEvents) {
        queryClient.setQueryData(queryKeys.events.all, context.previousEvents);
      }

      addNotification({
        type: 'error',
        message: 'Failed to delete event: ' + (error instanceof Error ? error.message : 'Unknown error'),
        title: 'Error',
      });
    },
  });

  return {
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
  };
};