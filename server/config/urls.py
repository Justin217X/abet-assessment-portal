"""
File: urls.py
Purpose: Maps incoming URLs to Django views

Reference: https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path
from integrations.views import demo_rubric_preview
from integrations.saved_rubric import saved_assignment_rubric, saved_assignment_rubric_pdf

urlpatterns = [
    path(
        'api/demo/assignment-versions/<uuid:version_id>/rubric/pdf/',
        saved_assignment_rubric_pdf,
        name='saved-assignment-rubric-pdf',
    ),
    path('admin/', admin.site.urls),
    path(
        'api/demo/assignment-versions/<uuid:version_id>/rubric/',
        saved_assignment_rubric,
        name='saved-assignment-rubric',
    ),
        path('api/demo/rubric-preview/', demo_rubric_preview, name='demo-rubric-preview'),
]
