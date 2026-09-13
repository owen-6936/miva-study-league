# Build and Deployment

## Full-Stack Requirement
This frontend assumes a backend implementing docs/api/openapi.yaml and Socket.IO events documented in the same spec.

Deploying only static frontend files is not enough for full functionality.

## Build Frontend
Run:
- pnpm install
- pnpm build

Build output goes to dist.

## Production Environment Variables
Example .env.production:

VITE_API_URL=https://api.miva-study-league.example/api
VITE_WS_URL=https://api.miva-study-league.example
VITE_APP_ENV=production

## Hosting Options
Frontend static host:
- Vercel
- Netlify
- Render Static Site
- Nginx static root

Backend host:
- Any Node/Express/Nest/Fastify stack that satisfies docs/api/openapi.yaml
- Must expose both REST and Socket.IO

## Reverse Proxy Example (Nginx)
Use one domain for frontend and backend behind routing:

```nginx
server {
    listen 80;
    server_name miva-study-league.example;

    root /var/www/miva-study-league/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## Backend Deployment Checklist
- Implement all required routes from docs/api/openapi.yaml.
- Support JWT auth and refresh token flow.
- Emit required Socket.IO events.
- Configure CORS for frontend origin(s).
- Keep API versioning strategy stable.

## Frontend Deployment Checklist
- pnpm type-check passes.
- pnpm build succeeds.
- VITE_API_URL and VITE_WS_URL point to reachable services.
- Smoke test login, teams, missions, challenges, leaderboard, notifications, admin routes.

## GitHub Actions CI/CD
This repository includes a workflow that:
- Runs lint, type-check, OpenAPI validation, and build on pull requests to main.
- Runs the same checks on pushes to main.
- Deploys the frontend to GitHub Pages on pushes to main after checks pass.

Required repository setup:
1. In GitHub, go to Settings > Pages and set Source to GitHub Actions.
2. Add repository variables in Settings > Secrets and variables > Actions:
    - VITE_API_URL: production backend API URL
    - VITE_WS_URL: production realtime endpoint URL
    - VITE_BASE_PATH (optional): custom public base path (defaults to /<repo-name>/ for Pages)
3. Push to main to trigger automatic deployment.
