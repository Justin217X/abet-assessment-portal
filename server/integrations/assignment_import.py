"""
File: assignment_import.py
Purpose: Saves Canvas assignment responses and keeps a history of changes.
"""

from django.db import transaction
from django.utils import timezone

from .models import Assignment, AssignmentVersion, SourceRecord, SourceRevision

# Save one Canvas assignment response and return its saved version. [SD]
@transaction.atomic
def store_canvas_assignment(payload, *, canvas_course, import_run):
    # Check that the reponse belongs to the selected Canvas course. [SD]
    if str(payload['course_id']) != canvas_course.source_record.source_id:
        raise ValueError('The assignment belongs to a different Canvas course.')

    # Find the existing source record or create it if needed. [SD]
    source_record, _ = SourceRecord.objects.get_or_create(
        source_system='canvas',
        record_type='assignment',
        source_id=str(payload['id']),
    )

    # Lock this source record so two imports cannot use the same revision number. [SD]
    source_record = SourceRecord.objects.select_for_update().get(pk=source_record.pk)

    assignment, _ = Assignment.objects.get_or_create(
        source_record=source_record,
        defaults={'canvas_course': canvas_course},
    )

    if assignment.canvas_course_id != canvas_course.pk:
        raise ValueError('The saved assignment belongs to a different Canvas course.')

    latest = source_record.revisions.order_by('-revision_number').first()

    # Reuse the current version when the response has not changed. [SD]
    if latest is not None and latest.payload == payload:
        return AssignmentVersion.objects.get(
            assignment=assignment,
            source_revision=latest,
        )

    # Save a new snapshot without changing any earlier version. [SD]
    revision = SourceRevision.objects.create(
        source_record=source_record,
        import_run=import_run,
        revision_number=1 if latest is None else latest.revision_number + 1,
        retrieved_at=timezone.now(),
        payload=payload,
    )
    return AssignmentVersion.objects.create(
        assignment=assignment,
        source_revision=revision,
        title=payload['name'],
        instructions=payload.get('description'),
    )