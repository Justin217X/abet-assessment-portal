# File: sample_views.py
# Purpose: Lists and serves supplied historical PDF examples locally.
# !!! Development only. Real sign-in and per-user file permissions are pending. [SD]
from django.conf import settings
from django.http import FileResponse, Http404, JsonResponse
from django.views.decorators.clickjacking import xframe_options_sameorigin
from django.views.decorators.http import require_GET

from .sample_reports import sample_report_catalog, sample_report_path


@require_GET
def demo_sample_catalog(request):
    if not settings.DEBUG:
        raise Http404
    response = JsonResponse({'sample_reports': sample_report_catalog()})
    response['Cache-Control'] = 'private, no-store'
    return response


@require_GET
@xframe_options_sameorigin
def demo_sample_report(request, sample_id):
    if not settings.DEBUG:
        raise Http404
    row = next((item for item in sample_report_catalog() if item['id'] == sample_id), None)
    path = sample_report_path(row) if row else None
    if path is None:
        raise Http404('Sample PDF is not available on this machine.')
    try:
        stream = path.open('rb')
    except FileNotFoundError:
        raise Http404('Sample PDF is not available on this machine.')
    # Serve the original bytes; download=1 changes only browser handling.
    response = FileResponse(stream, content_type='application/pdf',
                            as_attachment=request.GET.get('download') == '1', filename=row['filename'])
    response['Cache-Control'] = 'private, no-store'
    response['X-Content-Type-Options'] = 'nosniff'
    return response


@require_GET
def demo_evaluator_sample_catalog(request):
    if not settings.DEBUG:
        raise Http404
    from .sample_reports import evaluator_sample_report_catalog
    from .portal_data import MockPortalProvider
    response = JsonResponse({'sample_reports': evaluator_sample_report_catalog(),
                             'campuses': MockPortalProvider().load().get('campuses', [])})
    response['Cache-Control'] = 'private, no-store'
    return response


@require_GET
@xframe_options_sameorigin
def demo_evaluator_sample_report(request, sample_id):
    if not settings.DEBUG:
        raise Http404
    from .sample_reports import evaluator_sample_report_catalog
    if not any(row['id'] == sample_id for row in evaluator_sample_report_catalog()):
        raise Http404
    return demo_sample_report(request, sample_id)
