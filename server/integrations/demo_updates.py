# File: demo_updates.py
# Purpose: Saves demo schedules, assigned tasks, and peer-review feedback.
# !!! Fixed demo user only. Real sign-in and production permissions are pending. [SD]

import copy
import uuid
from datetime import date

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ImproperlyConfigured

from .models import ImportRun, SourceRecord, SourceRevision
from .portal_data import DATASET_SOURCE_ID

EDIT_SOURCE = {'source_system': 'portal_demo', 'record_type': 'portal_edits', 'source_id': DATASET_SOURCE_ID}


# Add the latest saved demo edits to the records shown on portal pages.
def merge_demo_updates(data):
    source = SourceRecord.objects.filter(**EDIT_SOURCE).first()
    latest = source.revisions.order_by('-revision_number').first() if source else None
    if latest:
        for key, updates in latest.payload.get('records', {}).items():
            existing = {row['id']: row for row in data.get(key, [])}
            for record_id, values in updates.items():
                existing[record_id] = {**existing.get(record_id, {}), **values}
            data[key] = list(existing.values())
    return data


# Save feedback or completion for a review assigned to the fixed demo Faculty user.
@transaction.atomic
def save_demo_review(payload):
    if not settings.DEBUG or settings.PORTAL_DATA_PROVIDER != 'saved_mock':
        raise ImproperlyConfigured('Use development mode and saved_mock after running seed_portal_demo.')
    if not isinstance(payload, dict):
        raise ValueError('Expected a JSON object.')
    source, _ = SourceRecord.objects.get_or_create(**EDIT_SOURCE)
    source = SourceRecord.objects.select_for_update().get(pk=source.pk)
    latest = source.revisions.order_by('-revision_number').first()
    from .portal_data import PortalDataFacade
    data = PortalDataFacade().load()
    if not data.get('metadata', {}).get('fictional'):
        raise ImproperlyConfigured('Demo review saving requires fictional records.')
    review = next((row for row in data['peer_reviews'] if row['id'] == payload.get('review_id') and row['reviewer_id'] == 'faculty-1'), None)
    if review is None:
        raise ValueError('Choose a review assigned to the Faculty demo profile.')

    # Check feedback length and require feedback before completing a review.
    feedback = payload.get('feedback')
    status = payload.get('status', review['status'])
    if not isinstance(feedback, str) or len(feedback) > 10000 or status not in ['assigned', 'completed']:
        raise ValueError('Provide valid review feedback of at most 10000 characters.')
    if status == 'completed' and not feedback.strip():
        raise ValueError('Add feedback before completing the review.')

    # Copy earlier edits so the new save keeps them.
    records = copy.deepcopy(latest.payload.get('records', {}) if latest else {})
    row = {**review, 'feedback': feedback.strip(), 'status': status}
    records.setdefault('peer_reviews', {})[row['id']] = row

    # Record the change for the demo activity list.
    event = {'id': f'activity-{uuid.uuid4()}', 'occurred_at': timezone.now().isoformat(), 'actor': next(user['name'] for user in data['users'] if user['id'] == 'faculty-1'),
             'title': 'Peer review completed' if status == 'completed' else 'Peer review feedback saved',
             'description': f'Review {review["id"]} · Saved in local Django database',
             'roles': ['faculty', 'coordinator', 'admin'], 'kind': 'review', 'source': 'saved_demo', 'entity_id': review['id']}
    records.setdefault('activity', {})[event['id']] = event

    # Use the seeded import account to own this demo save.
    # !!! Production saves must record the actual signed-in user. [SD]
    seed = SourceRevision.objects.filter(source_record__source_system='portal_demo', source_record__record_type='dataset', source_record__source_id=DATASET_SOURCE_ID).order_by('-revision_number').first()
    if seed is None:
        raise ImproperlyConfigured('Run seed_portal_demo before saving reviews.')
    run = ImportRun.objects.create(requested_by=seed.import_run.requested_by, import_kind='portal_demo_review', status='completed', finished_at=timezone.now())
    SourceRevision.objects.create(source_record=source, import_run=run, revision_number=latest.revision_number + 1 if latest else 1, retrieved_at=timezone.now(), payload={'records': records})
    return row


# Undo this save if any part fails.
@transaction.atomic
def save_demo_plan(payload):

    if not settings.DEBUG or settings.PORTAL_DATA_PROVIDER != 'saved_mock':
        raise ImproperlyConfigured('Use development mode and saved_mock after running seed_portal_demo.')
    if not isinstance(payload, dict):
        raise ValueError('Expected a JSON object.')
    # Lock the edit record so two saves do not overwrite each other.
    source, _ = SourceRecord.objects.get_or_create(**EDIT_SOURCE)
    source = SourceRecord.objects.select_for_update().get(pk=source.pk)
    latest = source.revisions.order_by('-revision_number').first()
    from .portal_data import PortalDataFacade
    data = PortalDataFacade().load()

    if not data.get('metadata', {}).get('fictional'):
        raise ImproperlyConfigured('Demo planning requires fictional records.')
    # Check the plan title, semester, and due date before saving.
    kind = payload.get('kind')
    title = payload.get('title')
    if kind not in ['schedule', 'assignment'] or not isinstance(title, str) or not title.strip() or len(title) > 255:
        raise ValueError('Provide a schedule or assignment name of at most 255 characters.')
    semester = next((row for row in data['semesters'] if row['id'] == payload.get('semester_id')), None)
    if semester is None:
        raise ValueError('Choose a valid semester.')
    try:
        due = date.fromisoformat(payload.get('due_on', ''))
    except (TypeError, ValueError):
        raise ValueError('Provide a valid due date.')
    if not date.fromisoformat(semester['starts_on']) <= due <= date.fromisoformat(semester['ends_on']):
        raise ValueError('The due date must fall within the selected semester.')

    # Copy earlier edits so the new save keeps them.
    records = copy.deepcopy(latest.payload.get('records', {}) if latest else {})
    record_id = f'demo-{kind}-{uuid.uuid4()}'

    if kind == 'schedule':
        program_id = payload.get('program_id')
        if not any(row['id'] == program_id for row in data['programs']):
            raise ValueError('Choose a valid program.')
        row = {'id': record_id, 'semester_id': semester['id'], 'program_id': program_id,
               'title': title.strip(), 'owner_id': 'coordinator-1', 'due_on': due.isoformat()}
        key = 'schedules'
    else:
        course = next((row for row in data['courses'] if row['id'] == payload.get('course_id') and row['semester_id'] == semester['id']), None)
        faculty = next((row for row in data['users'] if row['id'] == payload.get('faculty_id') and 'faculty' in row['roles']), None)
        indicator = next((row for row in data['indicators'] if row['id'] == payload.get('indicator_id')), None)
        template = next((row for row in data['assessments'] if course and row['course_id'] == course['id']
                         and row['assignment_version_id'] == payload.get('assignment_version_id')
                         and indicator and row['indicator_id'] == indicator['id']), None)
        if course is None or faculty is None or template is None:
            raise ValueError('Choose a valid course, saved assignment, faculty member, and mapped PI.')
        version = next((row for row in data['assignment_versions'] if row['id'] == template['assignment_version_id']), None)
        criterion = next((row for row in (version['payload'].get('rubric') or []) if row['id'] == template['criterion_id']), None) if version else None
        group = next((row for row in data['student_groups'] if row['id'] == template['student_group_id'] and row['course_id'] == course['id']), None)
        if criterion is None or group is None or version['assignment_id'] != template['assignment_id']:
            raise ValueError('The saved assignment needs its mapped rubric criterion and course student group.')
        row = {**copy.deepcopy(template), 'id': record_id, 'task_title': title.strip(),
               'faculty_id': faculty['id'], 'status': 'to_start', 'due_on': due.isoformat(),
               'faculty_explanation': '', 'evidence_ids': [], 'schedule_id': None}
        # Keep fictional choices separate from the original assessment and unselected.
        for item in data['evidence']:
            if item['assessment_id'] == template['id']:
                new_item = {**copy.deepcopy(item), 'id': f'{record_id}-{item["band"]}-{item["student_id"]}',
                            'assessment_id': record_id, 'selected': False}
                records.setdefault('evidence', {})[new_item['id']] = new_item
        key = 'assessments'
    records.setdefault(key, {})[record_id] = row

    # Record the change for the demo activity list.
    event = {'id': f'activity-{uuid.uuid4()}', 'occurred_at': timezone.now().isoformat(),
             'actor': next(user.get('activity_label', user['name']) for user in data['users'] if user['id'] == 'coordinator-1'), 'title': 'Schedule saved' if kind == 'schedule' else 'Work assigned',
             'description': f'{title.strip()} · Due {due.isoformat()} · Saved in local Django database',
             'roles': ['coordinator', 'admin'] + (['faculty'] if row.get('faculty_id') == 'faculty-1' else []),
             'kind': kind, 'source': 'saved_demo', 'entity_id': record_id}
    records.setdefault('activity', {})[event['id']] = event

    # Use the seeded import account to own this demo save.
    # !!! Production saves must record the actual signed-in user. [SD]
    seed = SourceRevision.objects.filter(source_record__source_system='portal_demo', source_record__record_type='dataset', source_record__source_id=DATASET_SOURCE_ID).order_by('-revision_number').first()
    if seed is None:
        raise ImproperlyConfigured('Run seed_portal_demo before saving plans.')
    run = ImportRun.objects.create(requested_by=seed.import_run.requested_by, import_kind='portal_demo_edit', status='completed', finished_at=timezone.now())
    SourceRevision.objects.create(source_record=source, import_run=run, revision_number=latest.revision_number + 1 if latest else 1, retrieved_at=timezone.now(), payload={'records': records})
    return row
