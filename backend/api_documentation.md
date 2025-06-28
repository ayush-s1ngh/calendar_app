# API Documentation
The backend provides RESTful API endpoints for authentication, users, events, reminders, and categories.

## Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/logout` - Logout a user (requires authentication)

## User Endpoints
- `GET /api/users/me` - Get current user details (requires authentication)
- `PUT /api/users/me` - Update user details (requires authentication)
- `PUT /api/users/me/theme` - Update theme preference (requires authentication)

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
- `POST /api/events` - Create a new event (requires authentication)
  - Supports categories and recurrence rules
- `PUT /api/events/<id>` - Update an event (requires authentication)
- `DELETE /api/events/<id>` - Delete an event (requires authentication)
- `PUT /api/events/<id>/move` - Move an event (drag & drop) (requires authentication)
- `DELETE /api/events/bulk-delete` - Delete multiple events (requires authentication)

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

## Reminder Endpoints
- `GET /api/reminders/event/<id>/reminders` - Get reminders for an event (requires authentication)
- `POST /api/reminders/event/<id>/reminders` - Create a reminder for an event (requires authentication)
- `DELETE /api/reminders/<id>` - Delete a reminder (requires authentication)