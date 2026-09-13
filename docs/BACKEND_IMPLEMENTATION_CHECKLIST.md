# Backend Implementation Checklist

This checklist is generated from the required contract in docs/api/openapi.yaml.
Use it as an execution tracker while implementing the backend.

## How To Use
- Mark each item done only after implementation, validation, and integration test pass.
- Keep this file updated in pull requests that modify backend behavior.
- If an endpoint changes, update docs/api/openapi.yaml first, then this checklist.

## 1. Platform Foundation
- [ ] Create service skeleton with API base path /api.
- [ ] Enable CORS for frontend origin.
- [ ] Enable JSON body parsing and payload size limits.
- [ ] Add global request logging and correlation IDs.
- [ ] Add centralized error middleware with consistent ApiError shape.
- [ ] Add database migrations and seed strategy.
- [ ] Add health/readiness endpoints for deployment checks.

## 2. Auth and Security
- [ ] Implement JWT access token issuance.
- [ ] Implement refresh token issuance and rotation.
- [ ] Enforce Bearer auth for protected routes.
- [ ] Hash passwords using a strong algorithm (for example argon2 or bcrypt).
- [ ] Add rate limiting on auth endpoints.
- [ ] Add CSRF strategy if cookies are used.
- [ ] Implement role checks for admin-only routes.

## 3. Auth Endpoints
- [ ] POST /auth/login
- [ ] POST /auth/register
- [ ] POST /auth/forgot-password
- [ ] POST /auth/reset-password
- [ ] POST /auth/setup-password
- [ ] POST /auth/refresh
- [ ] POST /auth/logout
- [ ] GET /auth/me

Contract notes:
- Login response must include: user, token, refreshToken.
- Refresh response must include nested data.accessToken and data.refreshToken.

## 4. User Endpoints
- [ ] GET /users
- [ ] GET /users/{id}
- [ ] PATCH /users/{id}
- [ ] DELETE /users/{id}
- [ ] PATCH /users/{id}/role

## 5. Team Endpoints
- [ ] GET /teams
- [ ] POST /teams
- [ ] GET /teams/{id}
- [ ] PATCH /teams/{id}
- [ ] POST /teams/{id}/join
- [ ] POST /teams/{id}/leave
- [ ] POST /teams/{id}/transfer
- [ ] PATCH /teams/{id}/roles

## 6. Mission Endpoints
- [ ] GET /missions
- [ ] GET /missions/current
- [ ] GET /missions/{id}
- [ ] POST /missions
- [ ] PATCH /missions/{id}
- [ ] DELETE /missions/{id}
- [ ] POST /missions/{id}/publish

## 7. Challenge Endpoints
- [ ] GET /challenges
- [ ] GET /challenges/{id}
- [ ] POST /challenges
- [ ] PATCH /challenges/{id}
- [ ] POST /challenges/{id}/start
- [ ] POST /challenges/{id}/stop
- [ ] GET /challenges/{id}/rounds
- [ ] POST /challenges/{id}/rounds

## 8. Submission Endpoints
- [ ] GET /submissions
- [ ] POST /submissions
- [ ] POST /submissions/{id}/upload

## 9. Leaderboard Endpoints
- [ ] GET /leaderboard
- [ ] GET /leaderboard/weekly
- [ ] GET /leaderboard/history
- [ ] GET /leaderboard/individual

## 10. Score Endpoints
- [ ] GET /scores
- [ ] POST /scores
- [ ] PATCH /scores/{id}

## 11. Award Endpoints
- [ ] GET /awards
- [ ] POST /awards
- [ ] GET /awards/winners
- [ ] POST /awards/{id}/nominate
- [ ] POST /awards/{id}/winner

## 12. Notification Endpoints
- [ ] GET /notifications
- [ ] PATCH /notifications/{id}/read
- [ ] PATCH /notifications/read-all

## 13. Season Endpoints
- [ ] GET /season
- [ ] PATCH /season

## 14. Realtime Socket.IO Events
Client emits:
- [ ] timer:requestSync

Server emits:
- [ ] leaderboard:update
- [ ] challenge:started
- [ ] challenge:tick
- [ ] challenge:ended
- [ ] score:update
- [ ] notification:new
- [ ] timer:sync

## 15. Validation and Integration Gates
- [ ] Validate OpenAPI file in CI.
- [ ] Add contract tests for each endpoint group.
- [ ] Add auth negative tests (401/403/expired tokens).
- [ ] Add payload validation tests (400 cases).
- [ ] Add pagination/filter tests where applicable.
- [ ] Add Socket.IO integration tests for all listed events.
- [ ] Add end-to-end smoke test: login, mission, challenge, scores, leaderboard, notifications.

## 16. Definition of Done
- [ ] Every endpoint in docs/api/openapi.yaml is implemented.
- [ ] Frontend API hooks run without response shape mismatches.
- [ ] Realtime updates match event payload contracts.
- [ ] CI passes for lint, test, type-check, and OpenAPI validation.
- [ ] Deployment checklist in docs/DEPLOYMENT.md is satisfied.
