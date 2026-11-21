# File: demo_updates.py
# Purpose: Saves and reloads demo peer-review feedback without changing source files.
# !!! Fixed demo user only. Real sign-in and production permissions are pending. [SD]

import copy
import uuid

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
