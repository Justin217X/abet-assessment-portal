# File: wsgi.py
# Purpose: Gives a WSGI web server the application it needs to pass request to Django.
#
# Reference: https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/

import os

from django.core.wsgi import get_wsgi_application

# Use config.settings unless another settings module is already selected.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Give the web server the Django application.
application = get_wsgi_application()
