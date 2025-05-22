import sys
import datetime
from app import create_app, db
from app.models import User, Event, Reminder


def seed_database():
    """Seed the database with initial test data"""
    # Create the Flask app context
    app = create_app('development')

    with app.app_context():
        # Clear the database
        db.drop_all()
        db.create_all()

        print("Creating test users...")
        user1 = User(
            username="test_user",
            email="test@example.com",
            password="password123"
        )

        user2 = User(
            username="demo_user",
            email="demo@example.com",
            password="demo123"
        )

        db.session.add(user1)
        db.session.add(user2)
        db.session.commit()

        print("Creating test events...")
        # Current date for reference
        now = datetime.datetime.utcnow()

        # Create events for user1
        events_user1 = [
            Event(
                user_id=user1.id,
                title="Team Meeting",
                description="Weekly team sync meeting",
                start_datetime=now + datetime.timedelta(days=1, hours=10),
                end_datetime=now + datetime.timedelta(days=1, hours=11),
                color="blue"
            ),
            Event(
                user_id=user1.id,
                title="Doctor Appointment",
                description="Annual check-up",
                start_datetime=now + datetime.timedelta(days=3, hours=14),
                end_datetime=now + datetime.timedelta(days=3, hours=15),
                color="red"
            ),
            Event(
                user_id=user1.id,
                title="Birthday Party",
                description="John's birthday celebration",
                start_datetime=now + datetime.timedelta(days=5, hours=18),
                end_datetime=now + datetime.timedelta(days=5, hours=22),
                color="purple"
            )
        ]

        # Create events for user2
        events_user2 = [
            Event(
                user_id=user2.id,
                title="Project Deadline",
                description="Submit final project files",
                start_datetime=now + datetime.timedelta(days=2),
                end_datetime=now + datetime.timedelta(days=2, hours=23, minutes=59),
                is_all_day=True,
                color="green"
            ),
            Event(
                user_id=user2.id,
                title="Gym Session",
                description="Weekly workout",
                start_datetime=now + datetime.timedelta(days=4, hours=7),
                end_datetime=now + datetime.timedelta(days=4, hours=8, minutes=30),
                color="orange"
            )
        ]

        # Add all events to session
        for event in events_user1 + events_user2:
            db.session.add(event)

        db.session.commit()

        print("Creating test reminders...")
        # Add reminders for some events
        reminders = [
            Reminder(
                event_id=events_user1[0].id,  # Team Meeting
                reminder_time=events_user1[0].start_datetime - datetime.timedelta(minutes=30)
            ),
            Reminder(
                event_id=events_user1[1].id,  # Doctor Appointment
                reminder_time=events_user1[1].start_datetime - datetime.timedelta(hours=1)
            ),
            Reminder(
                event_id=events_user2[0].id,  # Project Deadline
                reminder_time=events_user2[0].start_datetime - datetime.timedelta(days=1)
            )
        ]

        for reminder in reminders:
            db.session.add(reminder)

        db.session.commit()

        print("Database seeded successfully!")


if __name__ == "__main__":
    seed_database()