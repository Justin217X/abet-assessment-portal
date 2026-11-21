# File: apps.py
# Purpose: Configures the academic app for Django

from django.apps import AppConfig

class AcademicsConfig(AppConfig):

    # Use a large integer ID for models without their own primary key.
    default_auto_field = 'django.db.models.BigAutoField'

    # Match the app's Python package name.
    name = 'academics'
