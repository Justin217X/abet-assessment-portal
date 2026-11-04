# Backend Setup

The backend uses Django and PostgreSQL. This setup was checked on Windows with Python 3.13.12 and PostgreSQL 17.11.

Run commands in PowerShell from the repository folder.

## Install dependencies

Create a virtual environment and install the packages:

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
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

Create Django’s database tables and check the setup:

```powershell
.\.venv\Scripts\python.exe backend\manage.py migrate
.\.venv\Scripts\python.exe backend\manage.py check
```

Start the server:

```powershell
.\.venv\Scripts\python.exe backend\manage.py runserver
```

Open http://127.0.0.1:8000/. Stop the server with Ctrl+C.

## Current status

The Django welcome page and PostgreSQL connection work. The React frontend, university sign-in, and Canvas integration have not been added.

Use fictional data for local development. macOS instructions still need to be tested.