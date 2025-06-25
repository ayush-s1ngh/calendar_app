#!/bin/bash
# Apply database migrations if needed
export FLASK_APP=app.py
flask db upgrade

# Start the server
gunicorn --bind 0.0.0.0:$PORT "app:create_app()"