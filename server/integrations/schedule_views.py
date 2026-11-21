# File: schedule_views.py
# Purpose: Saves schedules for the fixed demo Coordinator user.
# !!! Development only. Production sign-in and permissions remain pending. [SD]
import json

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.http import Http404, JsonResponse
from django.views.decorators.http import require_POST

from .demo_updates import save_demo_plan


@require_POST
def demo_save_plan(request):
    if not settings.DEBUG:
        raise Http404
    try:
        payload = json.loads(request.body)
        if not isinstance(payload, dict):
            raise ValueError('Expected a JSON object.')
        row = save_demo_plan(payload)
    except (ValueError, TypeError, UnicodeDecodeError) as error:
        return JsonResponse({'error': str(error)}, status=400)
    except ImproperlyConfigured as error:
        return JsonResponse({'error': str(error)}, status=503)
    response = JsonResponse(row, status=201)
    response['Cache-Control'] = 'no-store'
    return response
