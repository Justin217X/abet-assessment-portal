# File: test_settings.py
# Purpose: Uses a separate PostgreSQL account and database for automated tests.
#
# !!! Django creates and normally deletes the test database when tests run. [SD]
# !!! Never set the test database name to the development or production database. [SD]

import os

# Load the normal settings, then replace the database settings below.
from .settings import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'abet_portal_test',

         # Read the test account's credentials from environment variables.
        'USER': os.environ['TEST_DB_USER'],
        'PASSWORD': os.environ['TEST_DB_PASSWORD'],

        # Use the configured PostgreSQL server.
        'HOST': os.environ['DB_HOST'],
        'PORT': os.environ['DB_PORT'],

         # Set the exact database Django uses for tests.
        'TEST': {
            'NAME': 'abet_portal_test',
        }
    }
}
