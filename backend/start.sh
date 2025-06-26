#!/bin/bash
# Apply database migrations if needed
export FLASK_APP=run.py  # Changed from app.py
flask db upgrade --directory migrations

# Start the server with explicit production configuration
gunicorn --bind 0.0.0.0:$PORT "app:create_app('production')"