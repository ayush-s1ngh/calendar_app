from flask import request
from flask_jwt_extended import jwt_required, current_user
from datetime import datetime, timezone

from ... import db
from . import events_bp
from ...models import Event
from ...utils.responses import success_response, error_response
from ...utils.validators import validate_datetime_string
from ...utils.logger import logger

@events_bp.route('', methods=['GET'])
@jwt_required()
def get_all_events():
    """
    Get all events for the logged-in user

    Returns:
    - Success response with list of events
    """
    try:
        events = Event.query.filter_by(user_id=current_user.id).all()

        events_data = []
        for event in events:
            events_data.append({
                "id": event.id,
                "title": event.title,
                "description": event.description,
                "start_datetime": event.start_datetime.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z'),
                "end_datetime": event.end_datetime.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z') if event.end_datetime else None,
                "is_all_day": event.is_all_day,
                "color": event.color,
                "created_at": event.created_at.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z'),
                "updated_at": event.updated_at.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z')
            })

        return success_response(data=events_data)

    except Exception as e:
        logger.error(f"Error retrieving events: {str(e)}")
        return error_response("An error occurred while retrieving events", 500)


@events_bp.route('/<int:event_id>', methods=['GET'])
@jwt_required()
def get_event(event_id):
    """
    Get a specific event

    Parameters:
    - event_id: ID of the event

    Returns:
    - Success response with event details
    """
    try:
        event = Event.query.filter_by(id=event_id, user_id=current_user.id).first()

        if not event:
            return error_response("Event not found", 404)

        event_data = {
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "start_datetime": event.start_datetime.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z'),
            "end_datetime": event.end_datetime.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z') if event.end_datetime else None,
            "is_all_day": event.is_all_day,
            "color": event.color,
            "created_at": event.created_at.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z'),
            "updated_at": event.updated_at.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z')
        }

        return success_response(data=event_data)

    except Exception as e:
        logger.error(f"Error retrieving event {event_id}: {str(e)}")
        return error_response("An error occurred while retrieving the event", 500)


@events_bp.route('', methods=['POST'])
@jwt_required()
def create_event():
    """
    Create a new event

    Request body:
    - title: Event title
    - description: (optional) Event description
    - start_datetime: Event start datetime (ISO format)
    - end_datetime: (optional) Event end datetime (ISO format)
    - is_all_day: (optional) Boolean indicating all-day event
    - color: (optional) Event color

    Returns:
    - Success response with created event details
    """
    try:
        data = request.get_json()

        if not data:
            return error_response("Invalid request data", 400)

        # Required fields
        title = data.get('title')
        start_datetime_str = data.get('start_datetime')
        print("start datetime in backend : ", start_datetime_str)

        # Optional fields
        description = data.get('description')
        end_datetime_str = data.get('end_datetime')
        is_all_day = data.get('is_all_day', False)
        color = data.get('color', 'blue')

        # Validate required fields
        if not title:
            return error_response("Title is required", 400)

        # Validate start_datetime
        is_valid, start_dt_obj = validate_datetime_string(start_datetime_str)
        if not is_valid:
            return error_response(start_dt_obj, 400)  # start_dt_obj contains error message

        # Validate end_datetime if provided
        end_dt_obj = None
        if end_datetime_str:
            is_valid, end_dt_obj = validate_datetime_string(end_datetime_str)
            if not is_valid:
                return error_response(end_dt_obj, 400)  # end_dt_obj contains error message

            # Ensure end datetime is after start datetime
            if end_dt_obj <= start_dt_obj:
                return error_response("End datetime must be after start datetime", 400)

        # Create new event
        new_event = Event(
            user_id=current_user.id,
            title=title,
            description=description,
            start_datetime=start_dt_obj,
            end_datetime=end_dt_obj,
            is_all_day=is_all_day,
            color=color
        )

        # Save to database
        db.session.add(new_event)
        db.session.commit()

        # Return created event
        event_data = {
            "id": new_event.id,
            "title": new_event.title,
            "description": new_event.description,
            "start_datetime": new_event.start_datetime.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z'),
            "end_datetime": new_event.end_datetime.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z') if new_event.end_datetime else None,
            "is_all_day": new_event.is_all_day,
            "color": new_event.color,
            "created_at": new_event.created_at.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z'),
            "updated_at": new_event.updated_at.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z')
        }

        logger.info(f"Event created: {new_event.id} by user {current_user.username}")
        return success_response(data=event_data, message="Event created successfully", status_code=201)

    except Exception as e:
        logger.error(f"Error creating event: {str(e)}")
        db.session.rollback()
        return error_response("An error occurred while creating the event", 500)


@events_bp.route('/<int:event_id>', methods=['PUT'])
@jwt_required()
def update_event(event_id):
    """
    Update an event

    Parameters:
    - event_id: ID of the event

    Request body:
    - title: (optional) Event title
    - description: (optional) Event description
    - start_datetime: (optional) Event start datetime (ISO format)
    - end_datetime: (optional) Event end datetime (ISO format)
    - is_all_day: (optional) Boolean indicating all-day event
    - color: (optional) Event color

    Returns:
    - Success response with updated event details
    """
    try:
        event = Event.query.filter_by(id=event_id, user_id=current_user.id).first()

        if not event:
            return error_response("Event not found", 404)

        data = request.get_json()

        if not data:
            return error_response("Invalid request data", 400)

        # Process updates
        updates = {}

        # Update title if provided
        if 'title' in data:
            title = data['title']
            if not title:
                return error_response("Title cannot be empty", 400)
            updates['title'] = title

        # Update description if provided
        if 'description' in data:
            updates['description'] = data['description']

        # Update start_datetime if provided
        if 'start_datetime' in data:
            start_datetime_str = data['start_datetime']
            is_valid, start_dt_obj = validate_datetime_string(start_datetime_str)
            if not is_valid:
                return error_response(start_dt_obj, 400)
            updates['start_datetime'] = start_dt_obj

        # Update end_datetime if provided
        if 'end_datetime' in data:
            if data['end_datetime'] is None:
                updates['end_datetime'] = None
            else:
                end_datetime_str = data['end_datetime']
                is_valid, end_dt_obj = validate_datetime_string(end_datetime_str)
                if not is_valid:
                    return error_response(end_dt_obj, 400)
                updates['end_datetime'] = end_dt_obj

        # Check if end is after start
        start_time = updates.get('start_datetime', event.start_datetime)
        end_time = updates.get('end_datetime', event.end_datetime)

        if end_time and start_time and end_time <= start_time:
            return error_response("End datetime must be after start datetime", 400)

        # Update is_all_day if provided
        if 'is_all_day' in data:
            updates['is_all_day'] = bool(data['is_all_day'])

        # Update color if provided
        if 'color' in data:
            updates['color'] = data['color']

        # Apply updates
        for key, value in updates.items():
            setattr(event, key, value)

        db.session.commit()

        # Return updated event
        event_data = {
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "start_datetime": event.start_datetime.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z'),
            "end_datetime": event.end_datetime.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z') if event.end_datetime else None,
            "is_all_day": event.is_all_day,
            "color": event.color,
            "created_at": event.created_at.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z'),
            "updated_at": event.updated_at.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z')
        }

        logger.info(f"Event {event_id} updated by user {current_user.username}")
        return success_response(data=event_data, message="Event updated successfully")

    except Exception as e:
        logger.error(f"Error updating event {event_id}: {str(e)}")
        db.session.rollback()
        return error_response("An error occurred while updating the event", 500)


@events_bp.route('/<int:event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    """
    Delete an event

    Parameters:
    - event_id: ID of the event

    Returns:
    - Success response
    """
    try:
        event = Event.query.filter_by(id=event_id, user_id=current_user.id).first()

        if not event:
            return error_response("Event not found", 404)

        db.session.delete(event)
        db.session.commit()

        logger.info(f"Event {event_id} deleted by user {current_user.username}")
        return success_response(message="Event deleted successfully")

    except Exception as e:
        logger.error(f"Error deleting event {event_id}: {str(e)}")
        db.session.rollback()
        return error_response("An error occurred while deleting the event", 500)


@events_bp.route('/<int:event_id>/move', methods=['PUT'])
@jwt_required()
def move_event(event_id):
    """
    Update event dates (for drag and drop functionality)

    Parameters:
    - event_id: ID of the event

    Request body:
    - start_datetime: New start datetime
    - end_datetime: (optional) New end datetime

    Returns:
    - Success response with updated event details
    """
    try:
        event = Event.query.filter_by(id=event_id, user_id=current_user.id).first()

        if not event:
            return error_response("Event not found", 404)

        data = request.get_json()

        if not data:
            return error_response("Invalid request data", 400)

        # Required field
        start_datetime_str = data.get('start_datetime')

        if not start_datetime_str:
            return error_response("Start datetime is required", 400)

        # Validate start_datetime
        is_valid, start_dt_obj = validate_datetime_string(start_datetime_str)
        if not is_valid:
            return error_response(start_dt_obj, 400)

        # Update start datetime
        event.start_datetime = start_dt_obj

        # Update end datetime if provided
        if 'end_datetime' in data:
            if data['end_datetime'] is None:
                event.end_datetime = None
            else:
                end_datetime_str = data['end_datetime']
                is_valid, end_dt_obj = validate_datetime_string(end_datetime_str)
                if not is_valid:
                    return error_response(end_dt_obj, 400)

                # Ensure end datetime is after start datetime
                if end_dt_obj <= start_dt_obj:
                    return error_response("End datetime must be after start datetime", 400)

                event.end_datetime = end_dt_obj
        elif event.end_datetime:
            # If end datetime not provided but exists, adjust it to maintain the same duration
            duration = event.end_datetime - event.start_datetime
            event.end_datetime = start_dt_obj + duration

        db.session.commit()

        # Return updated event
        event_data = {
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "start_datetime": event.start_datetime.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z'),
            "end_datetime": event.end_datetime.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z') if event.end_datetime else None,
            "is_all_day": event.is_all_day,
            "color": event.color,
            "created_at": event.created_at.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z'),
            "updated_at": event.updated_at.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z')
        }

        logger.info(f"Event {event_id} moved by user {current_user.username}")
        return success_response(data=event_data, message="Event moved successfully")

    except Exception as e:
        logger.error(f"Error moving event {event_id}: {str(e)}")
        db.session.rollback()
        return error_response("An error occurred while moving the event", 500)