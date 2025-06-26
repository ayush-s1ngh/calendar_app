# Calendar App

A modern calendar application with React frontend and Flask backend.

## Live Demo
Visit the application: [Calendar App on Render](https://calendar-app-frontend-dhv4.onrender.com)

## Features
- User authentication and account management
- Create, update, delete, and view calendar events
- Set reminders for events
- Customizable UI with light/dark theme options
- Drag-and-drop event management
- Responsive design for all devices

## Tech Stack
- **Frontend**: React, Material-UI, FullCalendar
- **Backend**: Flask, SQLAlchemy, JWT Authentication
- **Database**: PostgreSQL (production), SQLite (development)

## Local Development

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Create and activate a virtual environment
3. Install dependencies: `pip install -r requirements.txt`
4. Set up database: `flask db upgrade`
5. Run the API server: `flask run`

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm start`

## License
MIT License