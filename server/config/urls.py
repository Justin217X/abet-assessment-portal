"""
File: urls.py
Purpose: Maps incoming URLs to Django views

Reference: https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path
from integrations.views import demo_rubric_preview

urlpatterns = [
    path('admin/', admin.site.urls),
        path('api/demo/rubric-preview/', demo_rubric_preview, name='demo-rubric-preview'),
]
