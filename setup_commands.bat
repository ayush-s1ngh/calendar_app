REM Make sure you're in the backend directory with your virtual environment activated
cd calendar_app\backend
venv\Scripts\activate

REM Install dependencies
pip install -r requirements.txt

REM Set environment variables (Windows)
set FLASK_APP=run.py
set FLASK_ENV=development

REM Test the application
flask run