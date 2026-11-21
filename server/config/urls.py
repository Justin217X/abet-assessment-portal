"""
File: urls.py
Purpose: Maps incoming URLs to Django views

Reference: https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""
from integrations.sample_views import demo_sample_catalog, demo_sample_report
from integrations.dashboard_views import demo_portal_data
from django.contrib import admin
from django.urls import path
from integrations.views import demo_rubric_preview

urlpatterns = [
    path('api/demo/sample-reports/', demo_sample_catalog, name='demo-sample-catalog'),
    path('api/demo/sample-reports/<str:sample_id>/', demo_sample_report, name='demo-sample-report'),
    path('api/demo/portal/', demo_portal_data, name='demo-portal-data'),
    path('admin/', admin.site.urls),
        path('api/demo/rubric-preview/', demo_rubric_preview, name='demo-rubric-preview'),
]
