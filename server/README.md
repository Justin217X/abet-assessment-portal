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

Create Djangoâ€™s database tables and check the setup:

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
