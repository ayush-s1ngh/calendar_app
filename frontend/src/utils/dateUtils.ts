// Existing imports...
import { addDays, format } from 'date-fns';

/**
 * Normalizes a date to handle timezone issues with FullCalendar
 */
export function normalizeDate(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Date(dateObj.getTime());
}

/**
 * Converts a date string from backend (which may lack 'Z') to a JS Date in UTC.
 * Always treat strings as UTC.
 */
export function parseBackendDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  // If the string is exactly "YYYY-MM-DDTHH:mm:ss" (no Z, no offset), treat as UTC.
  // If it already ends with Z or has an offset, Date will handle it.
  if (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(dateStr)
  ) {
    return new Date(dateStr + 'Z');
  }
  return new Date(dateStr);
}

/**
 * Converts a date to an ISO string that works consistently with our backend
 */
export function toBackendDate(date: Date | string): string {
  const dateObj = normalizeDate(date);
  return dateObj.toISOString();
}

export function fixDragOffset(date: Date): Date {
  return date;
}