# File: asgi.py
# Purpose: Gives an ASGI web server the application it needs to pass requests to Django.
#
# Reference: https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/


import os

from django.core.asgi import get_asgi_application

# Use config.settings unless another settings module is already selected.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Give the web server the Django application.
application = get_asgi_application()
