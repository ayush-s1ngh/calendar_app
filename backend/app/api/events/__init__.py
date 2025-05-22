from flask import Blueprint

events_bp = Blueprint('events', __name__)

# Remove the import of routes for now
# from . import routes