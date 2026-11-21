"""
File: urls.py
Purpose: Maps incoming URLs to Django views

Reference: https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""
from integrations.schedule_views import demo_save_plan
from integrations.evidence_views import demo_evidence_pdf
from integrations.review_views import demo_save_review
from integrations.sample_views import demo_sample_catalog, demo_sample_report, demo_evaluator_sample_catalog, demo_evaluator_sample_report
from integrations.dashboard_views import demo_portal_data
from django.contrib import admin
from django.urls import include, path
from integrations.views import demo_rubric_preview

urlpatterns = [
    path('api/demo/evaluator/sample-reports/', demo_evaluator_sample_catalog, name='demo-evaluator-sample-catalog'),
    path('api/demo/evaluator/sample-reports/<str:sample_id>/', demo_evaluator_sample_report, name='demo-evaluator-sample-report'),
    path('api/demo/plans/', demo_save_plan, name='demo-save-plan'),
    path('api/demo/reviews/', demo_save_review, name='demo-save-review'),
    path('api/demo/evidence/<str:evidence_id>/pdf/', demo_evidence_pdf, name='demo-evidence-pdf'),
    path('api/demo/sample-reports/', demo_sample_catalog, name='demo-sample-catalog'),
    path('api/demo/sample-reports/<str:sample_id>/', demo_sample_report, name='demo-sample-report'),
    path('api/demo/portal/', demo_portal_data, name='demo-portal-data'),
    path('admin/', admin.site.urls),
    path('api/demo/rubric-preview/', demo_rubric_preview, name='demo-rubric-preview'),
    
    # Assessment report endpoints. [JH]
    path('api/demo/', include('reports.urls')),
]
