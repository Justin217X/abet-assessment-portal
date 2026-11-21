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

## Import the fictional Canvas assignment

After setting up the local database and running migrations, run this from the repository folder:

```powershell
.\.venv\Scripts\python.exe server\manage.py import_mock_canvas_assignment
```

Expected output:

```
Saved assignment version ID: <saved UUID>
```

Run the command again with the same sample data. It prints the same saved version ID instead of creating another assignment version.

The command requests assignment 501 through the mock facade and saves it with the existing assignment importer. It uses the assignment and course JSON files in server/demo_data. Each run has a separate completed import-history entry.

This command works only in development mode. It creates an inactive bookkeeping account with no usable password for import history, not a portal sign-in account.

## Read a saved assignment rubric

Use the version ID printed by import_mock_canvas_assignment:

GET /api/demo/assignment-versions/<saved UUID>/rubric/

The development endpoint returns the saved assignment title, grading flag, criteria, ratings, and points. An unknown version returns 404; a saved assignment without a rubric returns an empty criteria list.

The existing fixture preview URL still works. React will be connected to the saved-version endpoint in a separate change. This endpoint is disabled outside development; live authentication and record access checks are not implemented here.

## Generate a basic sample Rubric Report PDF

Install the backend requirements first. From the repository folder, open the Django shell:

```powershell
python server/manage.py shell
```

Paste these lines into the shell:

```python
import json
from pathlib import Path
from types import SimpleNamespace
from django.conf import settings
from integrations.rubric_preview import build_rubric_preview
from reports.rubric_pdf import generate_rubric_pdf
payload = json.loads((settings.BASE_DIR / 'demo_data' / 'canvas_assignment_with_rubric.json').read_text(encoding='utf-8'))
version = SimpleNamespace(title=payload['name'], source_revision=SimpleNamespace(payload=payload))
preview = build_rubric_preview(version)
_ = Path('rubric_report_sample.pdf').write_bytes(generate_rubric_pdf(preview))
```

Open rubric_report_sample.pdf from the repository folder. It should show Demo Programming Assignment, the criterion and description, a maximum of 20 points, and the four ratings worth 20, 15, 10, and 5 points. The sample is fictional. Do not commit the generated PDF.

The generator accepts the same fields as the rubric preview. Download endpoints and the Faculty PDF button are separate changes.

Run the generator tests with: python server/manage.py test reports
