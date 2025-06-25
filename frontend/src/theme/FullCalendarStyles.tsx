import React from 'react';
import { GlobalStyles } from '@mui/material';
import { useThemeContext } from '../contexts/ThemeContext';

/**
 * Component to provide theme-specific styles for FullCalendar
 */
export const FullCalendarStyles = () => {
  const { mode } = useThemeContext();

  const isDark = mode === 'dark';

  return (
    <GlobalStyles
      styles={{
        '.fc': {
          // Calendar container
          '& .fc-toolbar-title': {
            color: isDark ? '#ffffff' : '#000000',
          },
          // Calendar header
          '& .fc-col-header-cell': {
            backgroundColor: isDark ? '#2c2c2c' : '#f5f5f5',
            color: isDark ? '#e0e0e0' : '#333333',
          },
          // Day cells
          '& .fc-daygrid-day': {
            backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
            border: `1px solid ${isDark ? '#333333' : '#e0e0e0'}`,
          },
          // Current day
          '& .fc-day-today': {
            backgroundColor: isDark ? '#2d3748 !important' : '#ebf8ff !important',
          },
          // Events
          '& .fc-event': {
            // This doesn't need specific styling as we control event colors directly
            boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.5)' : '0 1px 2px rgba(0,0,0,0.1)',
          },
          // Buttons
          '& .fc-button-primary': {
            backgroundColor: isDark ? '#2c2c2c' : '#f0f0f0',
            color: isDark ? '#e0e0e0' : '#333333',
            borderColor: isDark ? '#444444' : '#d0d0d0',
          },
          '& .fc-button-primary:not(:disabled):hover': {
            backgroundColor: isDark ? '#444444' : '#e0e0e0',
          },
          '& .fc-button-primary:disabled': {
            backgroundColor: isDark ? '#1a1a1a' : '#f8f8f8',
            color: isDark ? '#666666' : '#999999',
          },
          // Active button
          '& .fc-button-active': {
            backgroundColor: isDark ? '#1976d2 !important' : '#1976d2 !important',
            color: '#ffffff !important',
          },
          // Time slots
          '& .fc-timegrid-slot': {
            backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
            border: `1px solid ${isDark ? '#333333' : '#e0e0e0'}`,
          },
          // List view
          '& .fc-list-table': {
            backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
          },
          '& .fc-list-day-cushion': {
            backgroundColor: isDark ? '#2c2c2c' : '#f5f5f5',
            color: isDark ? '#e0e0e0' : '#333333',
          },
        },
      }}
    />
  );
};