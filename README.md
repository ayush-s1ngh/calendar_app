# Calendar App

A personal calendar application with event management and reminder functionality.

## Features

- User authentication and account management
- Calendar view with month/week/day layouts
- Event creation, editing, and deletion
- Drag-and-drop event management
- Reminder system with notifications
- Theme customization (light/dark mode)

## Technology Stack

### Backend
- Python 3.9+ with Flask 2.x framework
- Flask-RESTful for API development
- Flask-SQLAlchemy for ORM
- Flask-Migrate for database migrations
- Flask-JWT-Extended for authentication
- APScheduler for scheduled tasks and reminders

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Vue.js 3 as the frontend framework
- Axios for API requests
- TailwindCSS for styling
- LocalStorage/Cookies for storing theme preferences

### Database
- SQLite for development
- PostgreSQL for production

## Installation

### Backend Setup

1. Clone the repository:
git clone https://github.com/ayush-s1ngh/calendar_app.git cd calendar_app/backend

2. Create and activate a virtual environment:
python -m venv venv source venv/bin/activate # On Windows: venv\Scripts\activate

3. Install dependencies:
pip install -r requirements.txt

4. Set up environment variables:
cp .env.example .env

5. Initialize the database:
flask db init flask db migrate -m "Initial migration" flask db upgrade

6. Run the development server:
flask run

### Frontend Setup

1. Navigate to the frontend directory:
cd calendar_app/frontend

2. Install dependencies:
npm install

3. Run the development server:
npm run serve

## Development Progress

Currently in Phase 1: Project Setup & Environment Configuration

## License

[MIT License](LICENSE)