"""
File: apps.py
Purpose: Configures the integration app for Django.
"""
from django.apps import AppConfig

class IntegrationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'integrations'
