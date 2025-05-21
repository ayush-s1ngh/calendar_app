# Technology Stack
## Backend
- Python 3.9+ with Flask 2.x framework 
- Flask-RESTful for API development 
- Flask-SQLAlchemy for ORM 
- Flask-Migrate for database migrations 
- Flask-JWT-Extended for authentication 
- APScheduler for scheduled tasks and reminders

## Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Vue.js 3 as the frontend framework 
- Axios for API requests 
- TailwindCSS for styling 
- LocalStorage/Cookies for storing theme preferences

## Database

- SQLite for development
- PostgreSQL for production

# API Endpoints
## Authentication
- POST /api/auth/register - Register a new user 
- POST /api/auth/login - Log in a user
- POST /api/auth/logout - Log out a user

## User Management
- GET /api/users/me - Get current user details 
- PUT /api/users/me - Update user details 
- PUT /api/users/me/theme - Update theme preference

## Events

- GET /api/events - Get all events for the logged-in user
- GET /api/events/<id> - Get a specific event
- POST /api/events - Create a new event
- PUT /api/events/<id> - Update an event
- DELETE /api/events/<id> - Delete an event
- PUT /api/events/<id>/move - Update event dates (for drag and drop)

## Reminders

- GET /api/events/<event_id>/reminders - Get reminders for an event
- POST /api/events/<event_id>/reminders - Create a reminder for an event
- DELETE /api/reminders/<id> - Delete a reminder

# Database Schemas

## users
- id (PK, Integer)
- username (String, Unique)
- email (String, Unique)
- password_hash (String)
- theme_preference (String, default='light')
- created_at (DateTime)
- updated_at (DateTime)

## events
- id (PK, Integer)
- user_id (FK, Integer, references users.id)
- title (String)
- description (Text, nullable)
- start_datetime (DateTime)
- end_datetime (DateTime, nullable)
- is_all_day (Boolean, default=False)
- color (String, default='blue')
- created_at (DateTime)
- updated_at (DateTime)

## reminders
- id (PK, Integer)
- event_id (FK, Integer, references events.id)
- reminder_time (DateTime)
- notification_sent (Boolean, default=False)
- created_at (DateTime)
- updated_at (DateTime)

# Key Frontend Components/Libraries

- FullCalendar.js - Core calendar display with drag-and-drop functionality
- Vue Color Picker - For selecting event colors
- DateTimePicker - For selecting dates and times (Vue Flatpickr or similar)
- Vue Toast Notification - For displaying reminders and notifications
- VueUse - Utilities for theme switching and other common operations

# High-Level Architecture

The architecture follows a standard client-server model:
- Frontend sends HTTP requests to the backend
- Backend processes requests, interacts with the database, and returns JSON responses
- Scheduler component runs in the background to check for upcoming reminders
- Theme preferences are stored in both the database (for persistence) and browser storage (for quick access)
