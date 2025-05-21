# Make sure you're in the backend directory with your virtual environment activated
cd calendar_app/backend
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export FLASK_APP=run.py
export FLASK_ENV=development

# Or on Windows:
# set FLASK_APP=run.py
# set FLASK_ENV=development

# Test the application
flask run