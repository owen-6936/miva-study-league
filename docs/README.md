# MIVA Study League

MIVA Study League is a gamified team-learning platform with missions, weekly challenges,
leaderboards, awards, and realtime updates.

This frontend is prepared for true full-stack integration through:
- Typed REST endpoint contracts in the API layer.
- Token-based authentication with refresh flow.
- Socket.IO realtime event listeners.
- OpenAPI backend specification in docs/api/openapi.yaml.

## Tech Stack
- Framework: React 19 + TypeScript (strict)
- Styling: Tailwind CSS v4 with CSS-variable themes
- Animation: Motion + GSAP
- State: Zustand
- Routing: React Router v7
- Networking: Axios + Socket.IO Client

## Prerequisites
- Node.js 20+
- pnpm 9+
- Backend service implementing docs/api/openapi.yaml

## Quick Start
1. Install dependencies.
2. Create .env from .env.example.
3. Set backend URLs.
4. Start the app.

Example commands:
- pnpm install
- cp .env.example .env
- pnpm dev

## Environment Variables
- VITE_API_URL: Base REST API URL (default: http://localhost:3000/api)
- VITE_WS_URL: Socket.IO URL (default: http://localhost:3000)
- VITE_APP_ENV: Runtime environment label

## Current Project Structure
```text
src/
├── components/
│   ├── layout/     # Dashboard layout, navbar, sidebar, transitions
│   └── ui/         # Reusable UI primitives and composites
├── lib/
│   ├── api/        # Axios client, endpoint map, API hooks, shared API types
│   ├── stores/     # Zustand stores (auth, live events, notifications, theme)
│   ├── socket.ts   # Socket.IO setup and event handlers
│   └── utils.ts    # Shared utilities
├── pages/          # Route-level screens (public, protected, admin)
├── routes/         # Route composition and route guards
├── App.tsx
├── main.tsx
└── index.css
```

## Available Scripts
- pnpm dev: Start development server
- pnpm build: Type-check and build production bundle
- pnpm preview: Preview production build locally
- pnpm lint: Run ESLint
- pnpm lint:fix: Auto-fix lint issues
- pnpm format: Run Prettier on src files
- pnpm format:check: Check formatting only
- pnpm type-check: Run TypeScript checks
- pnpm openapi:validate: Validate backend OpenAPI contract

## Documentation Links
- [Architecture](./ARCHITECTURE.md)
- [Components](./COMPONENTS.md)
- [Backend API Overview](./BACKEND_API.md)
- [Backend Implementation Checklist](./BACKEND_IMPLEMENTATION_CHECKLIST.md)
- [OpenAPI Spec](./api/openapi.yaml)
- [API Spec Usage Notes](./api/README.md)
- [Deployment](./DEPLOYMENT.md)
- [Contributing](./CONTRIBUTING.md)
