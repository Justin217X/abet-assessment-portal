# Frontend Setup

The frontend uses React, TypeScript, Vite, and Tailwind CSS.

Run commands from the `client/` directory unless otherwise specified.

## Prerequisites

- Node.js (a supported LTS version)
- npm

Check your installed versions:

```bash
node --version
npm --version
```

## Install dependencies

From the repository root, navigate to the client directory:

```bash
cd client
```

Install the project dependencies:

```bash
npm ci
```

This installs the dependencies recorded in `package-lock.json`.

## Run the frontend

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal, typically:

http://localhost:5173/

Stop the server with Ctrl+C.

## Build the frontend

Run:

```bash
npm run build
```

This performs the configured TypeScript checks and generates a production build in `client/dist/`.

## Preview the build

Run:

```bash
npm run preview
```

Open the URL displayed in the terminal to preview the production build locally.

## Code checks

Run:

```bash
npm run lint
```

This runs the ESLint checks provided by the project.

## Project Structure

- `src/` - React application source code
- `src/main.tsx` - Starts the React application
- `src/App.tsx` - Root application component. Connects the sign-in previews and role demos.
- `src/Button.tsx` - Defines the shared button.
- `src/components/` - Holds shared layout, cards, and tables.
- `src/dashboards/` - Holds the Faculty, Coordinator, Evaluator, and Adminitrator dashboards.
- `src/pages/sign-in/` - Holds the main sign-in screen and two sign-in previews.
- `src/pages/faculty/, src/pages/coordinator/, src/pages/evaluator and src/pages/administrator/` - Hold the pages opened from each dashboard.
- `src/index.css` - Tailwind CSS import and global styles
- `public/` - Static assets
- `index.html` - HTML entry point
- `vite.config.ts` - Vite configuration

## Current Status

The frontedn opens with two sign-in previews and four role demos. Each dashboard links to its role-specific pages. Tables and report previews show empty states until backend data is available. 

Authentication, Canvas integration, and Django API connections are planned for later development. See the backend setup guide for Django and PostgreSQL. The original HTML wireframes are kept in wireframes/.

## Team 18: Test UI Locally
From the repository root run:

git fetch origin
git switch feature/faculty-demo-entry
cd client
npm ci
npm run dev

Open the URL shown in the terminal, usually http://localhost:5173/

## Shared portal branding and layout

The four role demos now share the top header, campus photo banner, navigation area, content card, help panel, and footer. Sign out stays in the top header and returns to the demo sign-in screen; real session sign-out is still pending.

- Change university and portal names, banner image/crop, and pattern image in src/config/branding.ts.
- Change shared layout spacing and Tailwind-based styles in src/styles/DashboardStyles.css.
- CampusBanner and PortalIcon are reusable components.
- Edit original image/icon assets in public/images and public/icons. Do not edit generated dist copies.

This change updates the shared shell only. It does not add the newer dashboard records, roster, reporting workflow, authentication, or live university connections.

Faculty-specific styles and other feature icons will be added with their dashboard changes. The shared CSS retains faculty-prefixed names so later pages can reuse it.

## Faculty overview with shared mock records

Start Django and Vite, then open the Faculty demo. The overview reads /api/demo/portal/ and displays the selected semester's courses, assessment progress, tasks, deadlines, recent report records, assigned peer reviews, and activity.

Course, task, and recent-report search fields filter their lists. Long lists scroll inside panels. Switch semesters to update the overview.

The sample faculty profile is still fixed demo wiring, not real authentication. Report PDF downloads and the newer roster/report workflow are marked pending. The older detailed assessment, review, and archive previews remain until their separate changes are added.

This PR contains the overview and its shared display helpers only. No new API routes, saves, report generators, or detailed workflow pages are included.

## My Assessments with shared mock data

Open Faculty demo, then My assessments. The page requests the shared Django demo API and lists assignments for the fixed sample faculty profile across semesters.

Each card shows assignment, course, semester, status, and due date. Search also matches those fields. The progress summary reflects the displayed records, and the assessment list scrolls within its panel.

Loading, failed requests, no assigned work, and no search matches have separate messages. Report review remains pending until its own workflow change is added; this page accepts an optional onReviewAssessment callback for that later connection.

This change does not add report editing, evidence selection, PDF actions, or real user permissions.

## Faculty roster review

Open Faculty demo, then View roster. Use Campus and Subject (CMPSC/SWENG) to find an assigned mock class, then select View roster on its card.

The selected roster shows campus, course, semester, student label, program, section, enrollment status, and matching status. Search matches the student, program, section, or status. The table scrolls inside its own panel.

Changing filters clears the selected class so a roster from another campus cannot remain displayed. Course-campus assignments are fictional; filters use the shared demo records and do not grant permissions.

Uploads, source refresh, and saving confirmation are visibly disabled and marked pending. No roster editing, live LionPath connection, or server saving is added.

## Faculty report review

Open My assessments and select Review report, or use a task action on the overview. The Final Instrument Report tab shows the selected assessment; if nothing is selected, it asks you to choose an assigned assessment.

Four read-only sections show PI results, rubric/student group, faculty explanation, and evidence summaries. The heading identifies the course, semester, saved source revision, and status. Review roster opens the matching course.

Readiness checks describe available inputs only. Editing, evidence/file selection, live refresh, combined PDF actions, submission, and archiving stay disabled and marked pending. No report data is saved by this page.
