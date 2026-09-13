# Backend API Specification

This directory contains the backend API contract required by the frontend.

## Files
- openapi.yaml: OpenAPI 3.1 specification for all required REST endpoints.

## Frontend Alignment
The specification is aligned with:
- src/lib/api/endpoints.ts
- src/lib/api/client.ts
- src/lib/api/hooks/*
- src/lib/socket.ts

## Quick Validation
Use any OpenAPI validator or Swagger tooling.

Examples:
- npx @redocly/cli lint docs/api/openapi.yaml
- npx swagger-ui-watcher docs/api/openapi.yaml

## Mock Server
To mock the backend for frontend integration testing:
- npx @stoplight/prism-cli mock docs/api/openapi.yaml
