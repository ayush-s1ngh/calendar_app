# Calendar App

A modern calendar application with a React frontend and Flask backend.

## Current Status
- Last updated: 2025-05-22
- Current version: 1.0.0

## Features
- User authentication and account management
- Create, update, delete, and view calendar events
- Set reminders for events
- Customizable user interface with theme options
- Responsive design for desktop and mobile


## Tech Stack
- **Backend**: Flask, SQLAlchemy, Flask-JWT-Extended
- **Frontend**: React, Material-UI, FullCalendar (coming in Phase 4)
- **Database**: SQLite (development), PostgreSQL (production)

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/Mac: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Set up the database:
   - `python migrations_setup.py`
   - `flask db upgrade`
   - `python seed_data.py` (for test data)
6. Run the API server:
   - `set FLASK_APP=run.py` (Windows) or `export FLASK_APP=run.py` (Unix/Mac)
   - `flask run`

### Frontend Setup (Coming in Phase 4)
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm start`

## API Documentation
The backend provides RESTful API endpoints for authentication, users, events, and reminders.

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/logout` - Logout a user (requires authentication)

### User Endpoints
- `GET /api/users/me` - Get current user details (requires authentication)
- `PUT /api/users/me` - Update user details (requires authentication)
- `PUT /api/users/me/theme` - Update theme preference (requires authentication)

### Event Endpoints
- `GET /api/events` - Get all events for the current user (requires authentication)
- `GET /api/events/<id>` - Get a specific event (requires authentication)
- `POST /api/events` - Create a new event (requires authentication)
- `PUT /api/events/<id>` - Update an event (requires authentication)
- `DELETE /api/events/<id>` - Delete an event (requires authentication)

### Reminder Endpoints
- `GET /api/reminders/event/<id>/reminders` - Get reminders for an event (requires authentication)
- `POST /api/reminders/event/<id>/reminders` - Create a reminder for an event (requires authentication)
- `DELETE /api/reminders/<id>` - Delete a reminder (requires authentication)

## Contributors
- ayush-s1ngh

## License
MIT License
