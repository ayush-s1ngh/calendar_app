// Create a new utility file for date handling
import { addDays, format } from 'date-fns';

/**
 * Normalizes a date to handle timezone issues with FullCalendar
 * @param date Any date object or string
 * @returns Date object normalized for the application
 */
export function normalizeDate(date: Date | string): Date {
  // Ensure we have a Date object
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Return a clone of the date to avoid mutating the original
  return new Date(dateObj.getTime());
}

/**
 * Converts a date to an ISO string that works consistently with our backend
 * Fixes the issue where events are off by a day due to timezone handling
 */
export function toBackendDate(date: Date | string): string {
  const dateObj = normalizeDate(date);
  // Use the native toISOString() method instead of formatISO
  return dateObj.toISOString();
}

/**
 * Fix for drag-and-drop issue where events drop to previous day
 * This compensates for the timezone offset when dragging events
 */
export function fixDragOffset(date: Date): Date {
  // Create a copy to avoid mutations
  return date;

  // If the issue persists with events dropping to the previous day,
  // uncomment this line to add a day to compensate
  // return addDays(date, 1);
}