# Contributing to MIVA Study League

## Workflow
1. Branch from main.
2. Keep the scope focused.
3. Use branch prefixes:
   - feature/
   - fix/
   - chore/
   - docs/

## Commit Style
Use conventional commits.

Examples:
- feat: add challenge round timer sync
- fix: handle auth refresh retry race
- docs: update backend api contract

## Quality Standards
Before opening a PR, run:
- pnpm lint
- pnpm type-check
- pnpm build

## Documentation Requirements
If your change affects data contracts, realtime events, or API behavior, update:
- docs/api/openapi.yaml
- docs/BACKEND_API.md
- relevant JSDoc in src/lib/api and src/lib/socket.ts

If your change affects UI architecture or reusable components, update:
- docs/ARCHITECTURE.md
- docs/COMPONENTS.md

## JSDoc Requirement
All exported functions, hooks, and non-trivial utilities should have JSDoc comments with:
- purpose
- important parameters
- return contract
- error or side-effect notes when relevant

## Pull Request Checklist
1. Problem statement and implementation summary included.
2. UI screenshots included when UI changed.
3. API contract updates included when backend-facing behavior changed.
4. No dead files or temporary artifacts committed.
5. Local checks pass.
