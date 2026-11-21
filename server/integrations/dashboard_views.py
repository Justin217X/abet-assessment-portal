# File: dashboard_views.py
# Purpose: Returns prepared fictional records for the dashboard demos.
# !!! Development only; production authentication and record permissions are pending. [SD]

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.http import Http404, JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET

from .dashboard_data import load_dashboard_data


@require_GET
@ensure_csrf_cookie
def demo_portal_data(request):
    if not settings.DEBUG:
        raise Http404
    try:
        data = load_dashboard_data()
    except ImproperlyConfigured as error:
        return JsonResponse({'error': str(error)}, status=503)
    response = JsonResponse(data)
    response['Cache-Control'] = 'private, no-store'
    return response
