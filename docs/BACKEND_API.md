# Backend API Overview

This document summarizes the backend behavior required for this frontend to run as a full-stack application.

Canonical machine-readable contract:
- docs/api/openapi.yaml

Execution checklist:
- docs/BACKEND_IMPLEMENTATION_CHECKLIST.md

## Base URLs
- REST: VITE_API_URL (example: http://localhost:3000/api)
- Socket.IO: VITE_WS_URL (example: http://localhost:3000)

## Authentication Contract
Required endpoints:
- POST /auth/login
- POST /auth/register
- POST /auth/request-email-verification-code
- POST /auth/verify-email
- POST /auth/forgot-password
- POST /auth/reset-password
- POST /auth/setup-password
- POST /auth/refresh
- POST /auth/logout
- GET /auth/me

Expected login response shape consumed by frontend:
- user
- token
- refreshToken

Expected refresh response shape consumed by frontend interceptor:
- data.accessToken
- data.refreshToken

## Domain Endpoint Groups

- Timetable
  - GET /timetable
  - POST /timetable
  - PUT /timetable/{id}
  - DELETE /timetable/{id}

- Users
  - GET /users
  - GET /users/{id}
  - PATCH /users/{id}
  - DELETE /users/{id}
  - PATCH /users/{id}/role

- Teams
  - GET /teams
  - POST /teams
  - GET /teams/{id}
  - PATCH /teams/{id}
  - POST /teams/{id}/join
  - POST /teams/{id}/leave
  - POST /teams/{id}/transfer
  - PATCH /teams/{id}/roles

- Missions
  - GET /missions
  - GET /missions/current
  - GET /missions/{id}
  - POST /missions
  - PATCH /missions/{id}
  - DELETE /missions/{id}
  - POST /missions/{id}/publish

- Challenges
  - GET /challenges
  - GET /challenges/{id}
  - POST /challenges
  - PATCH /challenges/{id}
  - POST /challenges/{id}/start
  - POST /challenges/{id}/stop
  - GET /challenges/{id}/rounds
  - POST /challenges/{id}/rounds

- Submissions
  - GET /submissions
  - POST /submissions
  - POST /submissions/{id}/upload

- Leaderboard
  - GET /leaderboard
  - GET /leaderboard/weekly
  - GET /leaderboard/history
  - GET /leaderboard/individual

- Scores
  - GET /scores
  - POST /scores
  - PATCH /scores/{id}

- Awards
  - GET /awards
  - GET /awards/winners
  - POST /awards
  - POST /awards/{id}/nominate
  - POST /awards/{id}/winner

- Notifications
  - GET /notifications
  - PATCH /notifications/{id}/read
  - PATCH /notifications/read-all

- Season
  - GET /season
  - PATCH /season

## Socket.IO Event Requirements
Client emits:
- authenticate
- timer:requestSync

Server emits:
- leaderboard:update
- challenge:started
- challenge:tick
- challenge:ended
- score:update
- notification:new
- timer:sync

## Response and Error Guidance
- Return JSON for all responses.
- Keep date-time values in ISO-8601 format.
- Return 401 for auth failures and 403 for role violations.
- Use consistent error payloads with message and optional field errors.

## Integration Notes
- Keep endpoint paths aligned with src/lib/api/endpoints.ts.
- Keep response payload shapes aligned with src/lib/api/hooks/* and src/lib/api/client.ts.
- Update docs/api/openapi.yaml first whenever API behavior changes.


## Expected JSON Payloads & Schemas

To help you build the backend, here are the expected JSON schemas for the core objects that your Express endpoints should send and receive.

### 1. Authentication

**`POST /auth/login` Request:**
```json
{
  "email": "student@miva.edu.ng",
  "password": "securepassword123"
}
```

**`POST /auth/request-email-verification-code` Request:**
*Headers: `Authorization: Bearer <token>`*
*Behavior: Generates a 6-digit code, saves the JWT payload to the DB, and emails the user.*
```json
{} // No body needed, the backend gets the user ID/Email from the auth token
```

**`POST /auth/verify-email` Request:**
*Headers: `Authorization: Bearer <token>`*
*Behavior: Validates the code against the DB. If valid, sets `verified: true`.*
```json
{
  "code": "492015"
} // No email needed, the backend knows who they are from the auth token!
```

**`POST /auth/register` Request:**
```json
{
  "fullName": "Jane Doe",
  "email": "student@miva.edu.ng",
  "matricNumber": "2026/A/SENG/0036",
  "password": "securepassword123"
}
```

**`POST /auth/login` Response:**
```json
{
  "user": {
    "id": "uuid-string",
    "name": "Jane Doe",
    "email": "student@miva.edu.ng",
    "role": "student", // ENUM: 'student' | 'admin'
    "teamId": "team-uuid", // Foreign Key (null if unassigned)
    "team": "Alpha", // ENUM: 'Alpha' | 'Beta' | 'Gamma' | 'Delta' | 'Omega' | 'Sigma' | 'Zeta'
    "isVerified": true,
    "createdAt": "2023-01-01T00:00:00Z"
  },
  "token": "jwt-access-token-string",
  "refreshToken": "jwt-refresh-token-string"
}
```

### 2. Teams

**`GET /teams` Response:**
```json
[
  {
    "id": "uuid-string",
    "name": "Alpha",
    "color": "#FF5733",
    "emoji": "🐺",
    "points": 450,
    "memberCount": 7,
    "maxMembers": 7,
    "captainId": "user-uuid"
  }
]
```

**`POST /teams` Request:**
```json
{
  "name": "Alpha",
  "color": "#FF5733",
  "emoji": "🐺",
  "maxMembers": 7
}
```

### 3. Missions (Weekly Quests)

**`GET /missions` Response:**
```json
[
  {
    "id": "uuid-string",
    "title": "Week 1: Foundations",
    "description": "Complete the introduction module.",
    "points": 50,
    "deadline": "2023-10-15T23:59:59Z",
    "isPublished": true,
    "courseModule": "CS101",
    "type": "individual", // 'individual' | 'team'
    "createdAt": "2023-10-01T00:00:00Z"
  }
]
```

**`POST /missions` Request:**
```json
{
  "title": "Week 1: Foundations",
  "description": "Complete the introduction module.",
  "points": 50,
  "deadline": "2023-10-15T23:59:59Z",
  "courseModule": "CS101",
  "type": "individual"
}
```

### 4. Challenges (Live Events)

**`GET /challenges` Response:**
```json
[
  {
    "id": "uuid-string",
    "title": "Saturday Live Battle 1",
    "description": "Live algorithm challenge.",
    "startTime": "2023-10-14T10:00:00Z",
    "status": "scheduled", // 'scheduled' | 'active' | 'completed'
    "type": "quiz", // 'quiz' | 'coding' | 'debate'
    "maxPoints": 200
  }
]
```

### 5. Leaderboard

**`GET /leaderboard` Response:**
```json
[
  {
    "rank": 1,
    "team": {
      "id": "team-uuid",
      "name": "Alpha",
      "color": "#FF5733",
      "emoji": "🐺"
    },
    "totalPoints": 1200,
    "weeklyPoints": 350,
    "wins": 3,
    "losses": 1,
    "streak": 2,
    "trend": "up", // 'up' | 'down' | 'same'
    "pointHistory": [100, 250, 450, 750, 1200]
  }
]
```

### 6. Submissions

**`POST /submissions` Request:**
```json
{
  "challengeId": "uuid-string", // optional
  "missionId": "uuid-string", // optional
  "teamId": "uuid-string",
  "type": "text", // 'text' | 'file' | 'link'
  "textContent": "Here is our answer...", // if text
  "fileUrl": "https://s3.../file.pdf" // if file
}
```

### Standard Error Response (400, 401, 403, 404, 500)
```json
{
  "message": "Error description here",
  "errors": {
    "email": ["Invalid email format"] // Optional validation errors
  }
}
```

### 7. Team Assignment & Limits (Next Steps)

To handle the 100+ new users, the backend needs these specific endpoints built next.

**`POST /teams/:id/join` Request (Student picks a team):**
*Headers: `Authorization: Bearer <token>`*
*Behavior: 
1. Check if the user is already in a team (return 400 if true).
2. Check if the target team (`req.params.id`) has `members.length < team.maxMembers`. Return 400 if full.
3. Add `user._id` to the Team's `members` array.
4. Set `user.teamId = team._id` and `user.team = team.name`.
5. Return the updated user so the frontend can update its state.*
```json
// No Body Required! The team ID is in the URL path parameters.
{}
```

**`PATCH /teams/:id/capacity` Request (Admin increases limit):**
*Behavior: Since you now have 100+ students, Admins need this to increase the 7-member limit to ~15 or 20 per team.*
```json
{
  "maxMembers": 20
}
```

**`GET /system/stats` Response (Dashboard Overview):**
*Behavior: Provides the global totals for the landing page and dashboard.*
```json
{
  "totalStudents": 112,
  "totalTeams": 7,
  "activeMissions": 2,
  "totalPointsAwarded": 4500
}
```

---

## Admin & System Needs

These endpoints power the `/admin` UI, including the overview dashboard, the user table, and team limits. All of these require **both** `authenticate` and an `isAdmin` middleware.

### `GET /admin/stats`
*Headers: `Authorization: Bearer <token>`*
*Behavior: Aggregates counts for the top 4 stat cards on the Admin Dashboard.*
```json
{
  "totalUsers": 142,
  "activeTeams": 7,
  "activeMissions": 2,
  "totalSubmissions": 89
}
```

### `GET /admin/activities`
*Headers: `Authorization: Bearer <token>`*
*Behavior: Returns recent platform logs for the admin dashboard side panel. Queries the `Activity` collection.*
```json
{
  "activities": [
    { "text": "Team Alpha submitted a solution for Mission 3", "time": "10m ago" },
    { "text": "New user 'John Doe' registered", "time": "1h ago" }
  ]
}
```

### `GET /users` (Already requested, but confirming format)
*Headers: `Authorization: Bearer <token>`*
*Behavior: Returns all users. Required for the `/admin/users` data table.*
```json
[
  {
    "id": "60d5ecb8b3921c... ",
    "name": "Jane Doe",
    "email": "jane@miva.edu.ng",
    "matricNumber": "2026/A/SENG/0001",
    "team": "Alpha", // Or null
    "role": "student", // Or "admin"
    "verified": true
  }
]
```

### `PATCH /users/:id/role`
*Headers: `Authorization: Bearer <token>`*
*Behavior: Allows an admin to promote another user to admin, or demote them.*
```json
// Request Body
{
  "role": "admin" // or "student"
}
// Response
{
  "message": "User role updated successfully"
}
```

### `PATCH /teams/:id/capacity`
*Headers: `Authorization: Bearer <token>`*
*Behavior: Used to increase maxMembers as the cohort grows over 100+ students.*
```json
// Request Body
{
  "maxMembers": 20
}
```

### `POST /teams/seed`
*Headers: `Authorization: Bearer <token>` (Admin Only)*
*Behavior: Automatically generates and saves the 7 default MIVA teams into the database if they don't exist yet.*
```json
// Request Body
{}
// Response
{
  "message": "Teams seeded successfully",
  "teams": [...]
}
```

## 6. Announcements (v1.2.1)
The frontend dashboard consumes official announcements via `GET /announcements`.

**Interface Expectation:**
```typescript
export interface DashboardAnnouncement {
  id: string;
  title: string;
  content: string;
  date?: string;
  type?: string; // 'info', 'alert', 'success', 'warning'
  expiresAt?: string; // ISO String. Frontend automatically hides it if past this date.
}
```
*Note: Your backend can also filter by `expiresAt` directly to save payload bandwidth.*
