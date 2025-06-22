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
  
  // If the string already ends with 'Z', it's good to use directly
  if (dateStr.endsWith('Z')) {
    return new Date(dateStr);
  }
  
  // If the string has a timezone offset, use it directly
  if (dateStr.includes('+') || dateStr.includes('-')) {
    // But only if the + or - is in the time portion, not in a date separator
    const timeParts = dateStr.split('T');
    if (timeParts.length > 1 && (timeParts[1].includes('+') || timeParts[1].includes('-'))) {
      return new Date(dateStr);
    }
  }
  
  // If it's just "YYYY-MM-DDTHH:mm:ss" with no timezone, assume UTC
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(dateStr)) {
    return new Date(dateStr + 'Z');
  }
  
  // Default fallback
  return new Date(dateStr);
}

/**
 * Converts a date to an ISO string that works consistently with our backend
 * Always ensures timezone information is included
 */
export function toBackendDate(date: Date | string): string {
  const dateObj = normalizeDate(date);
  // Ensure timezone info is included with Z suffix for UTC
  const isoString = dateObj.toISOString();
  console.log("Converting to backend date:", dateObj, "->", isoString);
  return isoString;
}

export function fixDragOffset(date: Date): Date {
  return date;
}