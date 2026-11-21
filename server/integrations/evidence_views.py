# File: evidence_views.py
# Purpose: Returns PDF previews for fictional student-work examples.
# !!! Development only. These are not original student files or official reports. [SD]

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.http import Http404, HttpResponse, JsonResponse
from django.utils.text import slugify
from django.views.decorators.http import require_GET

from .dashboard_data import load_dashboard_data
from .evidence_pdf import generate_evidence_pdf


@require_GET
def demo_evidence_pdf(request, evidence_id):
    if not settings.DEBUG:
        raise Http404
    try:
        data = load_dashboard_data()
    except ImproperlyConfigured as error:
        return JsonResponse({'error': str(error)}, status=503)

    # Never render real records as fictional work.
    if not data.get('metadata', {}).get('fictional'):
        raise Http404
    evidence = next((row for row in data['evidence'] if row['id'] == evidence_id), None)
    if evidence is None:
        raise Http404
    response = HttpResponse(generate_evidence_pdf(data, evidence), content_type='application/pdf')
    filename = f'{slugify(evidence_id) or "fictional-work"}-preview.pdf'
    response['Content-Disposition'] = f'inline; filename="{filename}"'
    response['Cache-Control'] = 'no-store'
    return response
