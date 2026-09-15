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
- **Mission Management** (Create/delete missions, view participant rosters)
- **Team Management** (Edit team points, drop teams, manage rosters, assign Team Captains)
- **User Management** (View progress, allocate transfer tokens, bulk token resets)
- **Timetable Management** (Add, edit, import school schedules via REST API)
- **Hall of Fame & Awards** (Top scholars, top teams, speedrunners, cash prize banner)

---
*Powered by Miva Star Owen*

## 📦 Changelog

### v1.6.2 (Mission Portal UX Overhaul)
- **Course Filter Bar**: Added pill-style filter buttons to the Mission Portal. Students can view "All Courses" or tap a specific course to filter both active missions and the archive. Each pill shows the mission count.
- **Oldest → Newest Sort**: Active and past missions are now sorted chronologically (oldest first) so students see Week 1 before Week 2.
- **Announcements Fixed Height**: The dashboard announcements carousel now uses a locked `80px` container with internal scroll, preventing long announcements from pushing the layout around.

### v1.6.1 (Mission Visibility Fix)
- **Correct Mission Endpoint**: Switched both the Mission Portal and Dashboard from `/users/me/missions/current` (user-specific) to `/missions/current` (all active platform missions with future deadlines). All published missions now appear correctly.
- **Multi-Mission Support**: The Mission Portal now renders every active mission as its own full card instead of hard-coding to only the first one.
- **Dashboard Mission Carousel**: When multiple missions are active, the Dashboard "Current Mission" card cycles through them with animated slide transitions, dot indicators, and chevron controls.
- **Archive Accordion Fix**: Each past mission in the Mission Archive now has its own independent expand/collapse toggle, and displays `Completed` vs `Expired` badges correctly.

### v1.6.0 (The Polish & Launch Update)
- **Announcements Carousel**: Replaced the vertical announcement list on the Student Dashboard with a sleek auto-rotating carousel. Features smooth Framer Motion slide transitions, dot indicators, and manual chevron navigation. Auto-cycles every 5 seconds.
- **Maintenance Mode Removed**: Removed the login gate that was blocking student access during the admin-only maintenance window. All users can now log in normally.
- **Captain Visibility (Student Pages)**: Team Captains are now prominently displayed across all student-facing pages — Team Overview cards show a gold `👑 Captain: [Name]` badge, and the Team Hub member roster tags captains as `Student • Captain` with a crown emoji.
- **Full Lint & Type Cleanup**: Resolved all ESLint errors and TypeScript strict-mode violations across the entire codebase. Zero errors on both `pnpm lint` and `pnpm type-check`.
- **`User._id` Type Safety**: Added `_id?: string` to the global `User` interface to properly handle MongoDB document IDs without `any` casts.

### v1.5.0 (The Gamification Update)
- **Hall of Fame & Secret Cash Prizes**: Unlocked a dynamic end-of-season Hall of Fame celebrating the top 3 Global Scholars, top 3 Teams, and the fastest Mission Speedrunners. Added a dynamic prize banner announcing a tiered cash distribution system for the winning team!
- **Mission Roster Analytics**: Rebuilt the Admin Teams page to include a powerful "Manage Roster" modal, alongside a dedicated `/admin/missions/:id/participants` roster view to track task completion rates and XP per student.
- **Team Captains**: Admins can now instantly promote or demote students to "Team Captain" from within the Roster Modal. Captains get an exclusive Gold Crown badge platform-wide.
- **First Blood Widget**: The Mission Portal dynamically tracks and permanently celebrates the first student to finish a mission with an animated Trophy banner.
- **Visualized XP Growth Trajectory**: The Student Profile page now features an interactive Recharts Area chart plotting their exact XP growth over time.
- **Inline Admin Controls**: Added inline input editing for Transfer Tokens directly in the Admin Users table, plus a "Bulk Token Reset" feature for weekly resets.
- **Admin Specific User Grading UI**: Added a dedicated `admin-user-progress.tsx` interface to drill down into a specific student's submissions and manually override points.

### v1.4.0
- **TypeScript Strictness Overhaul**: Eliminated all remaining `any` types across the codebase. Enforced strict typing for API error handling (`AxiosError`) and API domain models (Teams, Missions, Users).
- **Maintenance Mode Gateway**: Injected robust maintenance mode logic into the Auth workflow, instantly evicting non-admin users with a toast alert.
- **Intelligent Dual-Routing for Missions**: Refactored the dashboard to pull from separate `/users/me/missions/current` and `/users/me/missions/past` endpoints, preventing completed tasks from cluttering the active workspace.
- **Double Submission Prevention**: Added robust boolean locks (`submittingTaskId`) and spinning loaders to prevent spam-clicking submissions.
- **Admin JSON Quiz Parser**: Rebuilt the Manual Grading Queue to cleanly parse and format raw JSON payloads for Quiz tasks if the auto-grader fails.
- **Google Drive iFrame Fix**: Wrote a custom Regex parser to safely extract raw file IDs from Google Drive links, preventing broken preview routing.

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
