from datetime import datetime, timedelta
from .. import scheduler, db, create_app
from ..models import Reminder, Event, User
from .logger import logger
import os


def check_reminders():
    """
    Check for upcoming reminders and mark them as sent
    This function will be called periodically by the scheduler
    """
    try:
        # Get environment from FLASK_ENV or default to development
        env = os.getenv('FLASK_ENV', 'development')

        # Create app with the same configuration as main app
        app = create_app(env)

        # Create and activate an application context
        with app.app_context():
            # Get current time
            current_time = datetime.utcnow()

            # Find reminders that are due within the next minute and not yet sent
            upcoming_reminders = Reminder.query.filter(
                Reminder.reminder_time <= current_time + timedelta(minutes=1),
                Reminder.notification_sent == False
            ).all()

            # Process each reminder
            for reminder in upcoming_reminders:
                try:
                    # Get associated event
                    event = Event.query.get(reminder.event_id)

                    if not event:
                        logger.warning(f"Reminder {reminder.id} references non-existent event {reminder.event_id}")
                        continue

                    # Get user
                    user = User.query.get(event.user_id)

                    if not user:
                        logger.warning(f"Event {event.id} references non-existent user {event.user_id}")
                        continue

                    # Log reminder (in a real app, this would send an email, push notification, etc.)
                    logger.info(
                        f"REMINDER for user {user.username}: Event '{event.title}' starts at {event.start_datetime}")

                    # Mark reminder as sent
                    reminder.notification_sent = True
                    db.session.commit()

                except Exception as inner_e:
                    logger.error(f"Error processing reminder {reminder.id}: {str(inner_e)}")
                    db.session.rollback()

    except Exception as e:
        logger.error(f"Error checking reminders: {str(e)}")


def init_reminder_scheduler():
    """Initialize the reminder scheduler"""
    # Check reminders every minute
    scheduler.add_job(
        func=check_reminders,
        trigger="interval",
        minutes=1,
        id="check_reminders",
        replace_existing=True
    )

    logger.info("Reminder scheduler initialized")