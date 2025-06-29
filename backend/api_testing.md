# Postman Testing Guide

## 1. Setup Postman Environment

Create a new environment in Postman with these variables:

- `base_url`: `http://localhost:5000/api`
- `access_token`: (will be set after login)
- `user_id`: (will be set after login)

---

## 2. Import Collection Structure

Create folders in Postman:

```

Calendar App API Tests/
├── 1. Authentication/
├── 2. Users/
├── 3. Categories/
├── 4. Events/
├── 5. Reminders/
└── 6. Bulk Operations/

````

---

## 3. Authentication Flow Tests

### A. Register New User

```http
POST {{base_url}}/auth/register
Content-Type: application/json

{ 
  "username": "postman_user", 
  "email": "postman@example.com", 
  "password": "PostmanTest123" 
}
````

**Test Script:**

```javascript
if (pm.response.code === 201) {
  const response = pm.response.json();
  pm.environment.set("access_token", response.data.tokens.access_token);
  pm.environment.set("user_id", response.data.user.id);
}
```

### B. Login with Existing User

```http
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "username": "test_user",
  "password": "TestPass123"
}
```

**Test Script:**

```javascript
if (pm.response.code === 200) {
  const response = pm.response.json();
  pm.environment.set("access_token", response.data.tokens.access_token);
  pm.environment.set("user_id", response.data.user.id);
}
```

### C. Verify Email (using seeded token)

```http
POST {{base_url}}/auth/verify-email/{{verification_token}}
```

### D. Request Password Reset

```http
POST {{base_url}}/auth/request-password-reset
Content-Type: application/json

{
  "email": "test@example.com"
}
```

### E. Google OAuth Flow

```http
GET {{base_url}}/auth/google/login
```

---

## 4. Category Tests

### A. Create Category

```http
POST {{base_url}}/categories
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "name": "Testing",
  "color": "cyan",
  "description": "Testing category from Postman"
}
```

### B. Get All Categories

```http
GET {{base_url}}/categories
Authorization: Bearer {{access_token}}
```

### C. Get Categories with Pagination

```http
GET {{base_url}}/categories?page=1&per_page=2
Authorization: Bearer {{access_token}}
```

---

## 5. Event Tests

### A. Create Simple Event

```http
POST {{base_url}}/events
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "title": "Postman Test Event",
  "description": "Created via Postman testing",
  "start_datetime": "2025-06-30T16:00:00Z",
  "end_datetime": "2025-06-30T17:00:00Z",
  "color": "cyan",
  "category_ids": [1]
}
```

### B. Create Event with Reminders

```http
POST {{base_url}}/events
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "title": "Meeting with Reminders",
  "description": "Testing reminder creation",
  "start_datetime": "2025-07-01T10:00:00Z",
  "end_datetime": "2025-07-01T11:00:00Z",
  "color": "red",
  "category_ids": [1, 2],
  "reminders": [
    {
      "minutes_before": 15,
      "notification_type": "email"
    },
    {
      "minutes_before": 60,
      "notification_type": "push"
    },
    {
      "reminder_time": "2025-06-30T22:00:00Z",
      "notification_type": "email"
    }
  ]
}
```

### C. Create Recurring Event

```http
POST {{base_url}}/events
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "title": "Weekly Postman Test",
  "description": "Testing recurring events",
  "start_datetime": "2025-06-30T14:00:00Z",
  "end_datetime": "2025-06-30T15:00:00Z",
  "color": "purple",
  "category_ids": [1],
  "recurrence_rule": {
    "frequency": "WEEKLY",
    "interval": 1,
    "days_of_week": ["MON", "WED", "FRI"],
    "occurrence_count": 10
  },
  "reminders": [
    {
      "minutes_before": 30,
      "notification_type": "email"
    }
  ]
}
```

### D. Get Events with Filters

```http
GET {{base_url}}/events?category_id=1&include_recurring=true&page=1&per_page=5
Authorization: Bearer {{access_token}}
```

### E. Search Events

```http
GET {{base_url}}/events?search=meeting
Authorization: Bearer {{access_token}}
```

### F. Update Event

```http
PUT {{base_url}}/events/1
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "title": "Updated Event Title",
  "description": "Updated description",
  "color": "orange"
}
```

### G. Move Event (Drag & Drop)

```http
PUT {{base_url}}/events/1/move
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "start_datetime": "2025-07-02T10:00:00Z",
  "end_datetime": "2025-07-02T11:00:00Z"
}
```

---

## 6. Reminder Tests

### A. Get Event Reminders

```http
GET {{base_url}}/reminders/event/1/reminders
Authorization: Bearer {{access_token}}
```

### B. Create Individual Reminder

```http
POST {{base_url}}/reminders/event/1/reminders
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "minutes_before": 45,
  "notification_type": "email"
}
```

### C. Update Reminder

```http
PUT {{base_url}}/reminders/1
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "minutes_before": 30,
  "notification_type": "push"
}
```

### D. Bulk Create Reminders

```http
POST {{base_url}}/reminders/bulk
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "reminders": [
    {
      "event_id": 1,
      "minutes_before": 10,
      "notification_type": "email"
    },
    {
      "event_id": 2,
      "minutes_before": 20,
      "notification_type": "push"
    }
  ]
}
```

---

## 7. Bulk Operations Tests

### A. Bulk Delete Events

```http
DELETE {{base_url}}/events/bulk-delete
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "event_ids": [2, 3]
}
```

### B. Bulk Move Events

```http
PUT {{base_url}}/events/bulk/move
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "event_ids": [1, 4],
  "time_offset_minutes": 60
}
```

### C. Bulk Copy Events

```http
POST {{base_url}}/events/bulk/copy
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "event_ids": [1, 4],
  "time_offset_minutes": 10080,
  "copy_reminders": true
}
```

### D. Bulk Delete Reminders

```http
DELETE {{base_url}}/reminders/bulk
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "reminder_ids": [1, 2, 3]
}
```

---

## 8. Error Testing

### A. Test Rate Limiting

```http
POST {{base_url}}/auth/register
Content-Type: application/json

{
  "username": "rate_test_{{$randomInt}}",
  "email": "rate{{$randomInt}}@example.com",
  "password": "TestPass123"
}
```

### B. Test Validation Errors

```http
POST {{base_url}}/events
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "title": "",
  "start_datetime": "invalid-date",
  "reminders": [
    {
      "minutes_before": -10
    }
  ]
}
```

### C. Test Unauthorized Access

```http
GET {{base_url}}/events
Authorization: Bearer invalid_token
```

---

## 9. Testing Checklist

**Authentication Flow**

* Register new user
* Login with credentials
* Verify email with token
* Request password reset
* Test Google OAuth initiation

**Categories**

* Create categories
* Get all categories
* Test pagination
* Update category
* Try to delete category with events

**Events**

* Create simple event
* Create event with reminders
* Create recurring event
* Test all filter parameters
* Update event
* Move event

**Reminders**

* Get event reminders
* Create relative reminder
* Create absolute reminder
* Update reminder
* Bulk create reminders

**Bulk Operations**

* Bulk delete events
* Bulk move events
* Bulk copy events
* Bulk delete reminders

**Error Handling**

* Test rate limiting
* Test validation errors
* Test unauthorized access
* Test not found errors