"""
File: urls.py
Purpose: Maps incoming URLs to Django views

Reference: https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""
from integrations.schedule_views import demo_save_plan
from integrations.review_views import demo_save_review
from integrations.dashboard_views import demo_portal_data
from django.contrib import admin
from django.urls import path
from integrations.views import demo_rubric_preview

urlpatterns = [
    path('api/demo/plans/', demo_save_plan, name='demo-save-plan'),
    path('api/demo/reviews/', demo_save_review, name='demo-save-review'),
    path('api/demo/portal/', demo_portal_data, name='demo-portal-data'),
    path('admin/', admin.site.urls),
        path('api/demo/rubric-preview/', demo_rubric_preview, name='demo-rubric-preview'),
]
