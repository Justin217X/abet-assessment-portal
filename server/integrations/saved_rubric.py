# File: saved_rubric.py
# Purpose: Returns rubric fields for one saved assignment version.
# !!! Development endpoint only; real sign-in and record access checks are pending. [SD]

from django.conf import settings
from django.http import Http404, JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_GET

from .models import AssignmentVersion
from .rubric_preview import build_rubric_preview


@require_GET
def saved_assignment_rubric(request, version_id):
    if not settings.DEBUG:
        raise Http404

    version = get_object_or_404(
        AssignmentVersion.objects.select_related('source_revision'),
        pk=version_id,
    )
    response = JsonResponse(build_rubric_preview(version))
    response['Cache-Control'] = 'private, no-store'
    return response
