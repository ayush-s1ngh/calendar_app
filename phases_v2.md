# Personal Calendar App - Feature Upgrade Phase Plan

## Phase 1: Backend Core Improvements

- **Recurring Events**
  - Update database model to support event recurrence (e.g., RRULE or custom fields).
  - Add logic to expand recurring events in API responses.
  - Extend CRUD endpoints in `/api/events` for recurrence rules.
- **Event Categories/Tags**
  - Update models to support event categories/tags.
  - Add endpoints for creating, listing, and assigning categories/tags.
- **API Pagination for Events**
  - Add pagination support to `/api/events` endpoints.
  - Update query logic and API documentation.
- **Better Error Handling**
  - Standardize error responses across all endpoints.
  - Add more granular error catching and logging.

---

## Phase 2: Backend Reminders & Security

- **Add Reminder When Creating Event**
  - Update `/api/events` POST endpoint to accept reminders as part of event creation.
- **Prevent Past Reminders**
  - Add server-side validation to prevent reminders in the past.
- **Bulk Event Operations**
  - Implement endpoints for bulk delete/move of events.
- **Account Verification & Password Reset**
  - Add endpoints for email verification during registration.
  - Implement password reset flow (request, token, reset).
- **Google Account Sign-In**
  - Integrate OAuth2 endpoints for Google login (Flask-Dance or similar).
  - Store and handle Google-authenticated users.

---

## Phase 3: Frontend Foundation & Core Features

- **Update API Client**
  - Support pagination, recurrence, and new endpoints in the frontend API layer.
- **User Authentication Enhancements**
  - Add UI for account verification and password reset.
  - Integrate Google Sign-In using Google Identity Services.
- **Recurring Events UI**
  - Add options to create, view, and manage recurring events in the event modal.
- **Event Categories/Tags**
  - Allow users to assign categories/tags when creating or editing events.
  - Add filter UI for categories/tags.
- **Reminder Enhancements**
  - Allow adding reminders during event creation.
  - Display errors for past reminders on UI.

---

## Phase 4: Frontend Improvements & Bulk Actions

- **Event List & Pagination**
  - Implement event listing with pagination support.
- **Bulk Event Operations**
  - Add UI for selecting and deleting/moving multiple events.
- **Improved Error Handling**
  - Display user-friendly error messages for all API errors.
  - Add error boundaries/components if not present.
- **Better Notification System**
  - Show error/success notifications for all important actions.
- **UI Polish**
  - Review and fix any layout/UI quirks (e.g., sidebar resizing issue).

---

## Phase 5: Integration, Testing & Documentation

- **Integration Testing**
  - Test all new backend and frontend features together.
- **Cross-browser/User Testing**
  - Check new flows for recurring events, reminders, bulk actions, Google login, etc.
- **Documentation**
  - Update API docs for new endpoints/flows.
  - Update user documentation for new features and flows.
- **Deployment**
  - Prepare deployment scripts for backend and frontend.
  - Announce new features to users.

---
