# Frontend Architecture

## System Overview
MIVA Study League uses a client-driven architecture with:
- Route-based React pages.
- A centralized API layer using Axios.
- Zustand stores for cross-page client state.
- Socket.IO for live updates.

The backend contract is documented in docs/api/openapi.yaml.

## Runtime Layers
1. UI Layer
- Route pages in src/pages and reusable components in src/components.

2. Integration Layer
- REST integrations in src/lib/api.
- Socket integrations in src/lib/socket.ts.

3. State Layer
- Auth/session in src/lib/stores/auth-store.ts.
- Live challenge state in src/lib/stores/live-store.ts.
- Notifications in src/lib/stores/notification-store.ts.
- Theme persistence in src/lib/stores/theme-store.ts.

## Source Structure
- src/components/layout: Shell components, navbar, sidebar, transitions.
- src/components/ui: Shared UI primitives and widgets.
- src/lib/api/client.ts: Axios instance, auth header injection, 401 refresh handling.
- src/lib/api/endpoints.ts: Single source of endpoint paths.
- src/lib/api/types.ts: Request and response domain types.
- src/lib/socket.ts: Socket lifecycle and event handlers.
- src/routes/index.tsx: Public, protected, and admin route tree.

## Routing Model
Public routes:
- /
- /login
- /register
- /forgot-password
- /reset-password/:token

Protected routes under dashboard layout:
- /dashboard
- /leaderboard
- /teams and /teams/:teamId
- /missions and /missions/:missionId
- /challenges and /challenges/:challengeId
- /hall-of-fame
- /profile
- /settings

Admin routes (role-gated):
- /admin
- /admin/users
- /admin/teams
- /admin/missions
- /admin/challenges
- /admin/scores

## REST Contract Expectations
The frontend is strictly typed using TypeScript schemas in `src/lib/api/types.ts`. It expects the backend to provide endpoint groups for:
- auth
- users
- teams
- missions
- challenges
- submissions
- leaderboard
- scores
- awards
- notifications
- season

Canonical contract: docs/api/openapi.yaml.

## Auth and Token Flow
1. Login returns user, token, and refreshToken.
2. apiClient adds Authorization: Bearer token on requests.
3. On 401, interceptor calls /auth/refresh using refreshToken.
4. New tokens are written back to auth store.
5. If refresh fails, session is cleared and user is redirected to /login.

## Realtime Flow
On authenticated app state:
- connectSocket opens Socket.IO connection.
- Client emits authenticate with JWT token.
- Store updates happen from server events:
	- leaderboard:update
	- challenge:started
	- challenge:tick
	- challenge:ended
	- score:update
	- notification:new
	- timer:sync

## Styling and Theme Model
- Tailwind CSS v4 utilities with CSS variables in src/index.css.
- Theme tokens are bound through @theme inline and data-theme attributes.
- Components consume semantic classes (bg-primary, text-text, border-border) to remain theme-safe.

## Animation Model
- Motion: component entrance, transitions, feedback states.
- GSAP: heavy scroll and timeline choreography where needed.
- CSS keyframes: lightweight loops and decorative effects.
