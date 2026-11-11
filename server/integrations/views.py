"""
File: views.py
Purpose: Holds web request handlers for the integrations app..
"""

import json
from pathlib import Path
from types import SimpleNamespace

from django.conf import settings
from django.http import Http404, JsonResponse
from django.views.decorators.http import require_GET

from .rubric_preview import build_rubric_preview


@require_GET
def demo_rubric_preview(request):
    # Serve only the fictional fixture, and only in development. [SD]
    if not settings.DEBUG:
        raise Http404

    fixture_path = (
        Path(__file__).parent / 'test_data' / 'canvas_assignment_with_rubric.json'
    )
    with fixture_path.open(encoding='utf-8') as fixture:
        payload = json.load(fixture)

    version = SimpleNamespace(
        title=payload['name'],
        source_revision=SimpleNamespace(payload=payload),
    )
    return JsonResponse(build_rubric_preview(version))
