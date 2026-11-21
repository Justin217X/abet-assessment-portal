# File: review_views.py
# Purpose: Saves feedback for reviews assigned to the demo Faculty user.
# !!! Development only. Production sign-in and permissions remain pending. [SD]
import json

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.http import Http404, JsonResponse
from django.views.decorators.http import require_POST

from .demo_updates import save_demo_review


@require_POST
def demo_save_review(request):
    if not settings.DEBUG:
        raise Http404
    try:
        payload = json.loads(request.body)
        if not isinstance(payload, dict):
            raise ValueError('Expected a JSON object.')
        row = save_demo_review(payload)
    except (ValueError, TypeError, UnicodeDecodeError) as error:
        return JsonResponse({'error': str(error)}, status=400)
    except ImproperlyConfigured as error:
        return JsonResponse({'error': str(error)}, status=503)
    response = JsonResponse(row)
    response['Cache-Control'] = 'no-store'
    return response
