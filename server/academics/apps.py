""" 
File: apps.py
Purpose: Configures the academic app for Django 
"""

from django.apps import AppConfig

class AcademicsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'academics'
