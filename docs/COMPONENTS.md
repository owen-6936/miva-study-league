# Component Library

UI components live in src/components and are split into layout-level and reusable UI-level modules.

## Design Principles
- Theme-safe by default through semantic color classes and CSS variables.
- Reusable API-first interfaces for cross-page consistency.
- Motion used where it improves UX, not as decoration only.
- Accessible defaults for focus, labels, and keyboard interaction.

## Directory Groups
- src/components/layout
	- dashboard-layout.tsx
	- navbar.tsx
	- sidebar.tsx
	- footer.tsx
	- page-transition.tsx

- src/components/ui
	- Core controls: button, input, select, switch, tabs, modal, dropdown
	- Data display: card, badge, avatar, progress, stat-card, data-table
	- Activity and realtime: countdown-timer
	- Visual effects: particle-bg, animated-counter
	- Utility wrappers: file-upload, team-badge, label

## Key Component Contracts
### Button
- Motion-enabled button abstraction.
- Supports variants: primary, secondary, ghost, destructive, outline.
- Supports sizes: sm, md, lg.
- Supports loading state via isLoading.

### Card Family
- card, card-header, card-content, card-footer utility components.
- Standardized border, radius, and surface handling.

### Tabs
- Lightweight tab primitives for challenge workflows and dashboards.
- Keyboard accessible and theme-aware.

### DataTable
- Sortable header support.
- Configurable columns and cell rendering.

### FileUpload
- Supports upload flow used by challenge submissions.
- Works with backend multipart endpoint in docs/api/openapi.yaml.

### ParticleBg
- Decorative background effect.
- Should respect reduced-motion preferences where feasible.

## Usage Notes
- Prefer composition over prop-heavy one-off components.
- Keep API/data fetching in pages using the Axios client, not inside generic UI components.
- When adding a new reusable component, include:
	- explicit prop types
	- JSDoc for public props or exported helpers
	- one representative usage in a page or feature flow
