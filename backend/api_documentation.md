# API Documentation
The backend provides RESTful API endpoints for authentication, users, events, and reminders.

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
- `GET /api/events/<id>` - Get a specific event (requires authentication)
- `POST /api/events` - Create a new event (requires authentication)
- `PUT /api/events/<id>` - Update an event (requires authentication)
- `DELETE /api/events/<id>` - Delete an event (requires authentication)

## Reminder Endpoints
- `GET /api/reminders/event/<id>/reminders` - Get reminders for an event (requires authentication)
- `POST /api/reminders/event/<id>/reminders` - Create a reminder for an event (requires authentication)
- `DELETE /api/reminders/<id>` - Delete a reminder (requires authentication)