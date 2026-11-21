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

## Faculty explanation drafts

From a selected report, choose Edit report details, edit Faculty explanation, then Save Draft & Return to Review. Cancel discards unsaved edits.

Drafts use sessionStorage in the current browser tab. They are kept separate by dataset, assessment, and saved assignment version. Reloading the same tab keeps a saved draft; other tabs/devices do not receive it. Browser session restoration can preserve a tab, so this is not an archive or guaranteed permanent storage.

The shared API response and JSON files are unchanged. Failed storage writes show an error and keep the text available for retry. Invalid stored drafts fall back to the shared explanation.

The explanation and mock evidence selections are editable here. Scores, rubric, group information, evidence selection, file uploads, PDF actions, server saving, and submission are separate work.

## Faculty mock evidence picker

Choose Edit report details, then Choose mock example for a high, middle, or low category. The dialog lists eligible examples for the selected assessment, with student label, score, feedback, and suggestion flag.

Search by student or score, then select an example. Replacing one category keeps the other two choices. No example is selected automatically, and suggested ordering remains a proposed demo convenience.

Save Draft & Return to Review saves the explanation and selected evidence IDs in the current browser tab. Cancel discards unsaved choices. Earlier explanation-only browser drafts remain readable. This does not save to Django or change the shared JSON.

Readiness requires three eligible choices, one per category. No additional different-student rule is assumed without sponsor confirmation.

Mock PDF previews are connected below; actual graded-file uploads remain disabled and marked pending.

## Faculty evidence PDF preview buttons

Preview PDF opens the exact selected example or picker choice in a new tab.
Django must run in development mode with the mock evidence PDF endpoint.
The button shows loading and an error if the request fails, returns a non-PDF,
or the browser blocks the new tab. Allow pop-ups for the local portal if needed.
Previewing does not change the selected examples or save a draft.
These PDFs contain fictional work, not original Canvas attachments.
Graded-file uploads remain disabled and marked pending.

## Faculty peer reviews

Peer reviews loads assigned records for the fixed Faculty demo profile. Search by
course, assignment, semester, status, or due date. Choose View review to see the
linked report version and edit feedback. The list and details scroll internally.

Save feedback and Complete review use /api/demo/reviews/ with Django's CSRF token.
Run migrations and seed_portal_demo, set PORTAL_DATA_PROVIDER=saved_mock, and
restart Django in development mode first. Completion requires nonblank feedback.
Saved status and feedback appear in the list and survive reloading. Failed saves
keep the text available for retry. Loading, empty, and error states are included.

This does not provide real reviewer authorization or access to report documents.
Report PDF access, supporting documents, and Feedback on my reports are separate.

## Faculty report archive records

Report archive loads submitted and archived records linked to the fixed Faculty
demo user's assessments. Search course, assignment, semester, status, filename,
or report version. Newer records appear first. The list scrolls inside its panel.

View report details shows the saved report version, source revision, filename,
status, and generated date. Details follow the current search results so a hidden
record is not left open. Loading, empty, and failed-request states are included.

Preview and download buttons remain disabled and marked pending. These are mock
report records, not available PDF files. Historical PDF samples and real user
permissions are separate changes. This page does not save or edit records.

## Faculty historical PDF sample library

Report archive now has Provided PDF samples and Saved mock reports views.
The historical library reads /api/demo/sample-reports/ and searches by course,
PI, or filename. Choose Preview PDF to use the embedded viewer, Open PDF for
a separate tab, or Download sample for the original file. The list scrolls inside
its panel. Filtering removes previews that are outside the current results.

Place the original PDFs in server/demo_data/pdf_samples, or configure
PORTAL_SAMPLE_PDF_DIR as described in server/README.md. Missing files remain
listed with disabled preview buttons. Loading and catalog errors are shown.
If the browser cannot embed a PDF, use Open PDF. The originals remain outside
Git and separate from AI-generated mock report records. Campus locations are
not assumed. This does not add production authentication or Evaluator releases.

## Coordinator schedule creation

Open the Coordinator demo, then Manage schedule from Overview. The form loads
program and semester options from the shared API. Enter a title and a due date
inside the selected semester, then Save schedule. The schedule list updates
after a successful save and can be searched by title, program, semester, or date.

First run migrations and seed_portal_demo, set PORTAL_DATA_PROVIDER=saved_mock,
and restart Django in development mode. Requests use /api/demo/plans/ and Django's
CSRF token. Saved schedules remain after reloading. Failed saves retain form
values for retry; loading, empty, and error states are included.

This creates new schedules only. Work assignment, editing existing schedules,
production permissions, and notifications remain separate changes.
