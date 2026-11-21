# Backend Setup

The backend uses Django and PostgreSQL. This setup was checked on Windows with Python 3.13.12 and PostgreSQL 17.11.

Run commands in PowerShell from the repository folder.

## Install dependencies

Create a virtual environment and install the packages:

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r server\requirements.txt
```

## Create a local database

Connect using the PostgreSQL administrator account:

```powershell
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -p 5432 -U postgres -d postgres
```

Create the application account:

```sql
CREATE ROLE abet_app LOGIN;
```

Set its password when prompted:

```text
\password abet_app
```

Create the database, then exit:

```sql
CREATE DATABASE abet_portal_dev OWNER abet_app;
```

```text
\q
```

## Add local settings

Copy `.env.example` to `.env` and enter your database password.

Generate your own Django secret key:

```powershell
.\.venv\Scripts\python.exe -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Add the key to `.env` in single quotes:

```dotenv
DJANGO_SECRET_KEY='your_generated_key'
```

Do not commit `.env` or share its contents.

## Run the backend

Create DjangoÃ¢â‚¬â„¢s database tables and check the setup:

```powershell
.\.venv\Scripts\python.exe server\manage.py migrate
.\.venv\Scripts\python.exe server\manage.py check
```

Start the server:

```powershell
.\.venv\Scripts\python.exe server\manage.py runserver
```

Open http://127.0.0.1:8000/. Stop the server with Ctrl+C.

## Current status

The Django welcome page and PostgreSQL connection work. The React frontend, university sign-in, and Canvas integration have not been added.

Use fictional data for local development. macOS instructions still need to be tested.

## Run tests

Create a separate local test account while connected to PostgreSQL as `postgres`:

```sql
CREATE ROLE abet_test LOGIN CREATEDB;
```

Set its password:

```text
\password abet_test
```

Add these values to your private `.env` file:

```dotenv
TEST_DB_USER=abet_test
TEST_DB_PASSWORD='your_test_account_password'
```

Run from the repository folder:

```powershell
.\.venv\Scripts\python.exe server\manage.py test academics --settings=config.test_settings
```

Django creates a temporary test database and removes it afterward.

## Source records and Canvas courses

SourceRecord stores an item's source system, record type, and original identifier. This prevents duplicate imports while allowing different item types to use the same source ID.

CanvasCourse represents a course space in Canvas. Multiple university course sections can link to it. A section can also exist without a Canvas link.

These models store information only. They do not connect to the live Canvas API.

Run the academic and integration tests from the repository folder:

```powershell
.\.venv\Scripts\python.exe server\manage.py test academics integrations --settings=config.test_settings
```

## Shared mock data provider

integrations/portal_data.py gives backend code one place to load shared fictional records.

- PORTAL_DATA_PROVIDER=mock reads server/demo_data/portal_demo.json each time.
- PORTAL_DATA_PROVIDER=saved_mock reads the latest saved mock dataset snapshot from PostgreSQL. If none exists, it reports an error instead of silently using another source.
- Other provider names are not implemented.
- Both choices are fictional, not live Canvas or LionPath connections.

PortalDataFacade().load() returns the selected source and adds today's date for current-date checks. The fixed scenario date stays unchanged. No records are saved by this loader.

This PR adds the provider layer only. Database seeding, saved edits, result calculations, evidence preparation, PDF catalogs, web endpoints, and dashboards are separate work.

## PI statistics calculations

reports/pi_calculations.py calculates counts, percentages, minimum, maximum, median, and mean scores for one rubric criterion. It also calculates average performance level and per-level statistics.

Only graded submissions with a score for that criterion count. Missing, excused, and unscored work is excluded; zero scores count.

The caller must first choose the correct assignment and student group and remove duplicate submissions. The current rubric labels are Beginning, Developing, Proficient, and Exemplary, with matching rating IDs. Other rating scales need separate support.

Run the focused tests: python server/manage.py test reports.test_pi_calculations

This change adds calculations only, not PDF reports, web endpoints, or dashboard pages.

## Prepare dashboard data

integrations/dashboard_data.py loads the configured shared mock provider and prepares assignment records and PI statistics for each assessment.

Calculations use that assessment's selected saved version, rubric criterion, and student group. Only active, matched enrollments in that group are counted. Missing selected criteria return no statistics. Group confirmation is a separate workflow step; this function does not confirm a group.

Preparation works on a copy and does not save or change source records. Evidence previews, saved demo edits, PDF catalogs, web endpoints, and dashboard UI are separate changes.

Run the focused tests: python server/manage.py test integrations.test_dashboard_data --settings=config.test_settings

## Shared dashboard demo API

GET /api/demo/portal/ returns the prepared fictional dashboard records and PI statistics from the configured mock provider.

The response includes the campus catalog and a current date for release-date checks. It is marked private/no-store and sets the CSRF cookie for later demo-save requests. This endpoint itself only reads data.

The endpoint is disabled when DEBUG=False. Unsupported providers or a missing saved snapshot return a clear 503 error. It is not a production data API: real login, role permissions, and per-user filtering still need implementation.

Dashboard UI, saved edits, evidence previews, and historical PDF file access are separate changes.

## Mock student-evidence choices

integrations/evidence_candidates.py prepares fictional high, middle, and low example choices from graded submissions for the assessment's selected rubric criterion and student group.

Only active, matched enrollments in the selected group are eligible. Missing, excused, ungraded, or unscored submissions are excluded; zero scores remain eligible.

The builder keeps existing evidence IDs and selections. New choices are not selected automatically and are not real files. Text and filename templates are read from server/demo_data/evidence_templates.json.

Suggested choices use highest, lowest, and nearest-to-median scores, with stable student-ID tie ordering. This is a proposed demo convenience, not a sponsor-approved rule. Actual sample selection, graded-file uploads, and any team/tie rules need separate confirmation.

This PR adds the builder and tests only. The picker UI, PDF previews, API connection, and saving selections are separate work.

Run focused tests: python server/manage.py test integrations.test_evidence_candidates

## Evidence choices in the shared API

GET /api/demo/portal/ now includes the prepared choices in its evidence list. Each choice identifies its assessment and includes rubric score/maximum, feedback, eligibility, and suggestion flags.

Existing evidence IDs and selections are preserved. New mock choices are unselected, and file_available remains false because generated text is not an original student attachment.

The source JSON is unchanged. This development-only API still does not provide real user permissions. Picker UI, PDF previews, and saving selections are separate changes.
## Save the shared demo dataset locally

After setting up the local development database and running migrations, run:

python server/manage.py seed_portal_demo

Expected first-run message:
Saved demo dataset, courses, sections, and assignment versions.

Run it again with unchanged input:
Demo data is already saved; no new records or versions created.

The command reads server/demo_data/portal_demo.json. It saves the full fictional snapshot and imports supported courses, sections, semesters, and assignment versions. Changed input creates a new snapshot and keeps earlier versions.

To read the saved snapshot, set PORTAL_DATA_PROVIDER=saved_mock in your local .env and restart Django. PORTAL_DATA_PROVIDER=mock continues reading the JSON file directly.

By default, an inactive account with no usable password owns the import history. You can instead use an existing local account with --username <username>. No real portal access is granted by seeding.

Use this only with development/test databases. It is disabled when DEBUG=False. It does not import live university data, save Faculty drafts, or provide dashboard web endpoints.

## Save demo peer-review feedback

Run migrations and seed_portal_demo, set PORTAL_DATA_PROVIDER=saved_mock,
and restart Django in development mode. POST JSON to /api/demo/reviews/:

{"review_id": "<assigned review ID>", "feedback": "Review comments", "status": "assigned"}

Use an ID from /api/demo/portal/ assigned to faculty-1. Use status completed
to finish the review; completed reviews require nonblank feedback. Feedback is
limited to 10,000 characters. Browser requests must include Django's CSRF token.

The response returns the saved review. Reload /api/demo/portal/ to see its latest
feedback, status, and activity entry. Each save keeps earlier edit snapshots.
Source JSON and imported assignment versions are unchanged.

Invalid requests return 400; missing seed data or the wrong provider returns 503.
The endpoint is disabled outside development. The fixed Faculty demo profile
is not real authorization. Production login and the peer-review UI are separate.
