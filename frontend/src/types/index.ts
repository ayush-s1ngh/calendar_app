// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  theme_preference: 'light' | 'dark';
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

// Event Types
export interface Event {
  id: number;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime?: string;
  is_all_day: boolean;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface EventFormData {
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime?: string;
  is_all_day: boolean;
  color: string;
}

// Reminder Types
export interface Reminder {
  id: number;
  event_id: number;
  reminder_time: string;
  notification_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReminderFormData {
  reminder_time: Date;
}

// Notification Type for frontend display
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
  eventId?: number;
  title?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}