# Portal demo workflows: review and test guide

This PR groups the previous small changes into one main-based, runnable demo.
Commits separate the shared foundation, Faculty workflow, Coordinator planning,
and remaining shared role views.

## Included

- Shared mock providers, seed command, dashboard API, and campus branding/layout.
- Faculty dashboard, assessments, roster viewing, report review and browser-tab drafts.
- Fictional high/middle/low evidence selection with PDF previews.
- Assigned peer-review feedback saving and completion through Django.
- Faculty mock archive records and a separate historical PDF library.
- Faculty browser-tab group confirmation, received review feedback, and draft activity.
- Coordinator shared progress, outcomes, archive, coverage, actions, and activity views.
- Evaluator released historical PDFs, read-only records, supporting-document options,
  and improvement actions, with campus/course filters.
- Administrator users, settings, errors, overview, and activity displays.
- Coordinator schedule creation and work assignment, including forms, saving,
  validation, list reloads, activity records, and backend tests.

## Local setup

Use the repository's existing Python environment and PostgreSQL configuration.
Never commit your .env or real university data.

From a clean checkout on Windows:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r server/requirements.txt
npm --prefix client ci
Copy-Item .env.example .env
```

Fill the private .env with your local PostgreSQL settings and Django secret key
as described in server/README.md. Do not overwrite an existing configured .env.
Then run:

```powershell
python server/manage.py migrate
python server/manage.py seed_portal_demo
```

Set PORTAL_DATA_PROVIDER=saved_mock in .env. Start Django and Vite in separate
terminals:

```powershell
python server/manage.py runserver
npm --prefix client run dev
```

The default CSRF setting allows localhost/127.0.0.1 on Vite port 5173. If Vite
chooses another port, set CSRF_TRUSTED_ORIGINS to that exact local URL and restart
Django. Keep Django on port 8000 for the committed Vite proxy.

Optional: copy supplied PDFs to server/demo_data/pdf_samples. They are ignored
by Git. PORTAL_SAMPLE_PDF_DIR can point at another local folder. Without these
original files, the library shows disabled missing-file buttons; generated mock
evidence PDF previews still work.

Mock is the default provider and reads JSON without database edits. Saving
requires saved_mock and the seed command. Canvas and roster connectors remain mock.

## Review in the browser

- Open Faculty Demo: choose a semester and inspect courses, deadlines, progress,
  recent reports, and activity.
- My assessments: search, select a report, review results and rubric, edit the
  explanation, select evidence, preview an example PDF, and save the tab draft.
- View roster: choose a course and test campus/subject filters and student search.
- Peer reviews: choose an assigned review, save feedback, complete it, and reload.
- Report archive: search Saved mock reports; switch to Provided PDF samples and
  preview/download an available original. Check the missing-file state too.
- Open Coordinator Demo: Create schedule, save a schedule and reload.
- Assign work: choose a course, saved assignment, Faculty user,
  mapped PI and semester date; save and verify it appears in Faculty assessments
  when assigned to Professor Martin. Reload to confirm persistence.

## What remains pending

This is a complete integration of the scoped demo workflows, not a production
ABET reporting system. Real SSO, Canvas/LionPath access, authorization, original
student-file uploads, server report drafts, final report generation/submission,
and automatic archiving remain pending and labeled in the UI. No notifications
are sent. Existing reports/ generators and their current routes are preserved.
Evaluator and Administrator views display shared demo data. Their unfinished
actions are disabled and marked pending. Evaluator release checks model a fixed
demo profile and are not real user authorization.

Justin is resolving report PRs #53, #54 and #58; this PR does not change files
under server/reports, the requirements file, or the existing Rubric/PI preview pages.

## Superseded PR coverage

- #55, #56, #57, #59, #60, #61: shared sources, seeding, preparation/API, layout.
- #62 through #76: Faculty lists, review/drafts/evidence, peer reviews, archive,
  and historical PDF access/library.
- #77, #78, #79: Coordinator schedule and work-assignment saving/UI.

These 24 PRs are replaced only after this integrated branch passes the checks.
No existing issue is fully completed by this integration; do not auto-close issues.
Keep the original branches so review history and earlier test evidence remain.

## Checks

- npm run lint --prefix client
- npm run build --prefix client
- python server/manage.py test academics integrations reports --settings=config.test_settings

Use a separate test database. Check current main again immediately before push,
resolve conflicts, and rerun any checks affected by new changes.

## Additional role checks

- Coordinator: inspect all menu tabs; verify campus and CMPSC/SWENG filters on
  course-linked records. Schedules & tasks shows shared records; Create schedule
  and Assign work perform the local demo saves.
- Faculty: verify a student group in View roster, return to the report, and
  inspect Recent activity. Peer reviews also has Feedback on my reports.
- Evaluator: switch Archived PDF examples / Released mock records, test campus
  and course filters, then Supporting documents and Improvement actions.
- Administrator: inspect Overview, Activity, Users & access, Application settings,
  and Application errors. Planned changes remain disabled until implemented.
