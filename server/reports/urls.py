"""
File: urls.py
Purpose: Maps report preview and PDF download URLs to their views.
"""

from django.urls import path

from . import views


urlpatterns = [
    path(
        'rubric-report/',
        views.demo_rubric_report,
        name='demo-rubric-report',
    ),
    path(
        'pi-report/',
        views.demo_pi_report,
        name='demo-pi-report',
    ),
    path(
        'pi-preview/',
        views.demo_pi_preview,
        name='demo-pi-preview',
    ),
]
