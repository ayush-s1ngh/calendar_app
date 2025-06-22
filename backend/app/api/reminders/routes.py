from flask import request
from flask_jwt_extended import jwt_required, current_user
from datetime import datetime, timezone

from ... import db
from . import reminders_bp
from ...models import Reminder, Event
from ...utils.responses import success_response, error_response
from ...utils.validators import validate_datetime_string
from ...utils.logger import logger


@reminders_bp.route('/event/<int:event_id>/reminders', methods=['GET'])
@jwt_required()
def get_event_reminders(event_id):
    """
    Get reminders for an event

    Parameters:
    - event_id: ID of the event

    Returns:
    - Success response with list of reminders
    """
    try:
        # Check if event exists and belongs to the current user
        event = Event.query.filter_by(id=event_id, user_id=current_user.id).first()

        if not event:
            return error_response("Event not found", 404)

        # Get reminders for the event
        reminders = Reminder.query.filter_by(event_id=event_id).all()

        reminders_data = []
        for reminder in reminders:
            reminders_data.append({
                "id": reminder.id,
                "event_id": reminder.event_id,
                "reminder_time": reminder.reminder_time.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z'),
                "notification_sent": reminder.notification_sent,
                "created_at": reminder.created_at.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z'),
                "updated_at": reminder.updated_at.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z')
            })

        return success_response(data=reminders_data)

    except Exception as e:
        logger.error(f"Error retrieving reminders for event {event_id}: {str(e)}")
        return error_response("An error occurred while retrieving reminders", 500)


@reminders_bp.route('/event/<int:event_id>/reminders', methods=['POST'])
@jwt_required()
def create_reminder(event_id):
    """
    Create a reminder for an event

    Parameters:
    - event_id: ID of the event

    Request body:
    - reminder_time: Reminder time (ISO format)

    Returns:
    - Success response with created reminder details
    """
    try:
        # Check if event exists and belongs to the current user
        event = Event.query.filter_by(id=event_id, user_id=current_user.id).first()

        if not event:
            return error_response("Event not found", 404)

        data = request.get_json()

        if not data:
            return error_response("Invalid request data", 400)

        # Required field
        reminder_time_str = data.get('reminder_time')

        if not reminder_time_str:
            return error_response("Reminder time is required", 400)

        # Validate reminder_time
        is_valid, reminder_time_obj = validate_datetime_string(reminder_time_str)
        if not is_valid:
            return error_response(reminder_time_obj, 400)

        # Ensure event.start_datetime is timezone aware before comparing
        event_start = event.start_datetime
        if event_start.tzinfo is None:
            event_start = event_start.replace(tzinfo=timezone.utc)

        # Now both datetimes are timezone-aware for proper comparison
        if reminder_time_obj >= event_start:
            return error_response("Reminder time must be before event start time", 400)

        # Create new reminder
        new_reminder = Reminder(
            event_id=event_id,
            reminder_time=reminder_time_obj,
            notification_sent=False
        )

        # Save to database
        db.session.add(new_reminder)
        db.session.commit()

        # Return created reminder
        reminder_data = {
            "id": new_reminder.id,
            "event_id": new_reminder.event_id,
            "reminder_time": new_reminder.reminder_time.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z'),
            "notification_sent": new_reminder.notification_sent,
            "created_at": new_reminder.created_at.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z'),
            "updated_at": new_reminder.updated_at.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z')
        }

        logger.info(f"Reminder created for event {event_id} by user {current_user.username}")
        return success_response(data=reminder_data, message="Reminder created successfully", status_code=201)

    except Exception as e:
        logger.error(f"Error creating reminder for event {event_id}: {str(e)}")
        db.session.rollback()
        return error_response("An error occurred while creating the reminder", 500)


@reminders_bp.route('/<int:reminder_id>', methods=['DELETE'])
@jwt_required()
def delete_reminder(reminder_id):
    """
    Delete a reminder

    Parameters:
    - reminder_id: ID of the reminder

    Returns:
    - Success response
    """
    try:
        # Find reminder
        reminder = Reminder.query.filter_by(id=reminder_id).first()

        if not reminder:
            return error_response("Reminder not found", 404)

        # Verify that the event associated with the reminder belongs to the current user
        event = Event.query.filter_by(id=reminder.event_id, user_id=current_user.id).first()

        if not event:
            return error_response("Unauthorized access to this reminder", 403)

        # Delete reminder
        db.session.delete(reminder)
        db.session.commit()

        logger.info(f"Reminder {reminder_id} deleted by user {current_user.username}")
        return success_response(message="Reminder deleted successfully")

    except Exception as e:
        logger.error(f"Error deleting reminder {reminder_id}: {str(e)}")
        db.session.rollback()
        return error_response("An error occurred while deleting the reminder", 500)