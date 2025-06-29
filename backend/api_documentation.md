# API Documentation
The backend provides RESTful API endpoints for authentication, users, events, reminders, and categories.

## Authentication Endpoints
- `POST /api/auth/register` - Register a new user with email verification
- `POST /api/auth/login` - Login a user
- `POST /api/auth/logout` - Logout a user (requires authentication)
- `POST /api/auth/verify-email/<token>` - Verify user email address
- `POST /api/auth/resend-verification` - Resend email verification (requires authentication)
- `POST /api/auth/request-password-reset` - Request password reset email
- `POST /api/auth/reset-password/<token>` - Reset password using token
- `GET /api/auth/google/login` - Initiate Google OAuth login
- `GET /api/auth/google/callback` - Handle Google OAuth callback

## User Endpoints
- `GET /api/users/me` - Get current user details (requires authentication)
- `PUT /api/users/me` - Update user details (requires authentication)
- `PUT /api/users/me/theme` - Update theme preference (requires authentication)

## Category Endpoints
- `GET /api/categories` - Get all categories for the current user (requires authentication)
  - Query Parameters:
    - `page` - Page number (optional)
    - `per_page` - Items per page (optional)
- `GET /api/categories/<id>` - Get a specific category (requires authentication)
- `POST /api/categories` - Create a new category (requires authentication)
- `PUT /api/categories/<id>` - Update a category (requires authentication)
- `DELETE /api/categories/<id>` - Delete a category (requires authentication)
- `GET /api/categories/<id>/events` - Get events in a category (requires authentication)

## Event Endpoints
- `GET /api/events` - Get all events for the current user (requires authentication)
  - Query Parameters:
    - `page` - Page number (default: 1)
    - `per_page` - Items per page (default: 50, max: 100)
    - `category_id` - Filter by category ID
    - `start_date` - Filter events starting from this date (ISO format)
    - `end_date` - Filter events up to this date (ISO format)
    - `include_recurring` - Include recurring event instances (default: true)
    - `search` - Search in title and description
- `GET /api/events/<id>` - Get a specific event (requires authentication)
- `POST /api/events` - Create a new event with optional reminders (requires authentication)
  - Supports categories, recurrence rules, and reminders
- `PUT /api/events/<id>` - Update an event (requires authentication)
- `DELETE /api/events/<id>` - Delete an event (requires authentication)
- `PUT /api/events/<id>/move` - Move an event (drag & drop) (requires authentication)
- `DELETE /api/events/bulk-delete` - Delete multiple events (requires authentication)
- `PUT /api/events/bulk/move` - Move multiple events by time offset (requires authentication)
- `POST /api/events/bulk/copy` - Copy multiple events (requires authentication)

## Reminder Endpoints
- `GET /api/reminders/event/<id>/reminders` - Get reminders for an event (requires authentication)
- `POST /api/reminders/event/<id>/reminders` - Create a reminder for an event (requires authentication)
- `PUT /api/reminders/<id>` - Update a reminder (requires authentication)
- `DELETE /api/reminders/<id>` - Delete a reminder (requires authentication)
- `POST /api/reminders/bulk` - Create multiple reminders (requires authentication)
- `DELETE /api/reminders/bulk` - Delete multiple reminders (requires authentication)

## Request Examples

### Authentication 
POST /api/auth/register \
Content-Type: application/json
```json
{ 
  "username": "testuser", 
  "email": "test@example.com", 
  "password": "TestPass123"
}
```

### Event Creation with Reminders
POST /api/events \
Authorization: Bearer <token> \
Content-Type: application/json
```json
{ 
  "title": "Team Meeting", 
  "description": "Weekly team sync", 
  "start_datetime": "2025-06-30T10:00:00Z", 
  "end_datetime": "2025-06-30T11:00:00Z", 
  "color": "blue", 
  "category_ids": [1, 2], 
  "reminders": [ 
    { "minutes_before": 15, "notification_type": "email" }, 
    { "reminder_time": "2025-06-30T09:00:00Z", "notification_type": "push" } 
  ], 
  "recurrence_rule":{
      "frequency": "WEEKLY", 
      "interval": 1, 
      "days_of_week": ["MON", "WED"], 
      "occurrence_count": 10
    }
}
```


### Bulk Operations
PUT /api/events/bulk/move \
Authorization: Bearer <token> \
Content-Type: application/json
```json
{ 
  "event_ids": [1, 2, 3], 
  "time_offset_minutes": 60
}
```

## Response Format
All endpoints return standardized JSON responses:
```
{ 
  "success": true|false, 
  "message": "Description", 
  "data": {...}, 
  "errors": {...} 
 }
```
## Rate Limits
- Registration: 5 per 5 minutes
- Login: 10 per 5 minutes
- Event creation: 30 per 5 minutes
- Reminder creation: 50 per 5 minutes
- Bulk operations: 10 per 5 minutes
- Password reset: 3 per 5 minutes

## Recurrence Patterns
Supported frequencies: DAILY, WEEKLY, MONTHLY, YEARLY
- `frequency` - Required
- `interval` - Optional (default: 1)
- `days_of_week` - For WEEKLY (["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"])
- `day_of_month` - For MONTHLY (1-31)
- `end_date` - Optional end date
- `occurrence_count` - Optional max occurrences

## Notification Types
- `email` - Email notifications
- `push` - Push notifications
- `sms` - SMS notifications