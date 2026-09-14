# MIVA Study League - Frontend

🌐 **Live Website:** [https://mivastudyleague.org](https://mivastudyleague.org)

The official React/TypeScript frontend for the MIVA Study League platform.

## 🚀 Overview

MIVA Study League is a competitive, gamified study platform where students join teams, complete weekly missions, and battle for the top spot on the leaderboard.

This frontend is built with:
- **React 18** (via Vite)
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** (for smooth UI animations)
- **Lucide React** (icons)
- **Zustand** (global state management)
- **Axios** (API client)

## 📁 Project Structure

- `/src/pages` - All route components (Dashboard, Arena, Admin pages).
- `/src/components` - Reusable UI elements and layout components.
- `/src/lib/api` - Axios API client and endpoint configurations.
- `/src/lib/stores` - Zustand stores for Auth and Theme.
- `/src/lib/utils` - Helper functions and constants (e.g. `TEAM_EMOJIS`).

## 🌍 Environment Variables

Vite automatically loads different `.env` files based on the command you run.

- **`.env.development`**: Loaded during `pnpm dev`. Points the API to `http://localhost:3000`.
- **`.env.production`**: Loaded during `pnpm build`. Points the API to your live backend server.
- **`.env.local`**: (Optional) Create this file for private, local overrides. It is git-ignored.

*Important:* Update `.env.production` with your actual live backend URL before deploying!

## 🛠️ Starting the App

### 👨‍💻 Development Mode
Use this for local testing. It features Hot Module Replacement (HMR) and uses `.env.development`.

```bash
# Install dependencies
pnpm install

# Start the local development server (usually on http://localhost:5173)
pnpm dev
```

### 🚀 Production Mode
Use this to build the optimized, minified files for live deployment. It statically embeds the variables from `.env.production`.

```bash
# 1. Compile TypeScript and build the optimized static files into the /dist folder
pnpm build

# 2. (Optional) Preview the built production files locally
pnpm preview
```
*Note for Deployment:* In a real production environment (like Vercel, Netlify, or Nginx), you don't run `pnpm dev`. Instead, you run `pnpm build` and serve the resulting `/dist` folder as a static website.

## 🔐 Admin Panel
Users with the `admin` role have access to the `/admin` route which includes:
- **Season Configuration** (Start dates, active toggles)
- **Mission Management** (Create/delete missions)
- **Team Management** (Edit team points, drop teams)
- **User Management** (Assign teams, allocate transfer tokens)
- **Timetable Management** (Add, edit, import school schedules via REST API)

---
*Powered by Miva Star Owen*

## 📦 Changelog

### v1.2.1
- **Announcement Expiration**: The Student Dashboard now natively supports an `expiresAt` property for announcements, automatically hiding them once their time has passed.
- **Leaderboard Resilience**: Improved the leaderboard parser to handle dynamic payload keys (`users` vs `topUsers`) and elegantly fallback to `fullName` if `name` is missing.
- **Activity Feed UI Limits**: Introduced constrained scrolling (`max-h-[400px]`) to the Recent Activity feeds across both Student and Admin dashboards to prevent infinite vertical layout stretching.
- **Mission UI Polish**: Fixed missing spacing on the Briefing Room / Arena tab icons and added a clean divider above the resources list.


### v1.2.0 (Flipped Classroom Update)
- **Rich Media Briefing Room**: Upgraded Mission Detail screen with a two-tab interface (`Briefing Room` and `The Arena`).
- **Smart Embedded Players**: Added automatic iframe embedding for YouTube and Google Drive Audio/Video resources, including a smart URL parsing fallback that auto-prepends `https://`.
- **Activity Log Simplification**: Refactored the Student Activity Feed and Admin Audit Log to consume a unified `message` string rather than requiring complex multi-part objects.
- **Mission Resource Schema Update**: Transitioned `Mission.resources` from an array of raw strings to a detailed array of objects (`{ title, type, url, description }`).


### v1.1.0
- **Dynamic Admin Stats**: The Admin Dashboard now dynamically fetches `Total Users`, `Active Teams`, `Active Missions`, and `Total Submissions` live from the database via `/admin/stats`.
- **Nested Quiz Architecture**: Rebuilt the mission structure to support multiple nested multiple-choice questions within a single quiz task.
- **Removed File Uploads**: Transitioned fully to URL submissions for external link verification to save object storage space.
- **Leaderboard Team UI Fixes**: Leaderboard UI properly links to team names and accurately displays MongoDB `points` integration.
- **Strict TypeScript Compliance**: Enforced strict adherence to domain models without using `any` mappings.
