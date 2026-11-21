# Portal demo workflows: review and test guide

This PR groups the previous small changes into one main-based, runnable demo.
Commits separate the shared foundation, Faculty workflow, and Coordinator planning.

## Included

- Shared mock providers, seed command, dashboard API, and campus branding/layout.
- Faculty dashboard, assessments, roster viewing, report review and browser-tab drafts.
- Fictional high/middle/low evidence selection with PDF previews.
- Assigned peer-review feedback saving and completion through Django.
- Faculty mock archive records and a separate historical PDF library.
- Coordinator schedule creation and work assignment, including forms, saving,
  validation, list reloads, activity records, and backend tests.

## Local setup

Use the repository's existing Python environment and PostgreSQL configuration.
Never commit your .env or real university data.

1. Install server/requirements.txt and the client dependencies.
2. Run python server/manage.py migrate.
3. Run python server/manage.py seed_portal_demo.
4. Set PORTAL_DATA_PROVIDER=saved_mock locally and restart Django.
5. Run Django on port 8000 and the Vite client on its configured local port.
   If Vite chooses another port, set CSRF_TRUSTED_ORIGINS to that exact local
   URL and restart Django. The default allows localhost/127.0.0.1 on port 5173.
6. Optional: copy supplied PDFs to server/demo_data/pdf_samples. They are ignored
   by Git. PORTAL_SAMPLE_PDF_DIR can point at another local folder.

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
- Open Coordinator Demo: Overview > Manage schedule, save a schedule and reload.
- Overview > Assign assessment: choose a course, saved assignment, Faculty user,
  mapped PI and semester date; save and verify it appears in Faculty assessments
  when assigned to Professor Martin. Reload to confirm persistence.

## What remains pending

This is a complete integration of the scoped demo workflows, not a production
ABET reporting system. Real SSO, Canvas/LionPath access, authorization, original
student-file uploads, server report drafts, final report generation/submission,
and automatic archiving remain pending and labeled in the UI. No notifications
are sent. Existing reports/ generators and their current routes are preserved.
Evaluator and Administrator shared-data workflows remain separate local work.

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
