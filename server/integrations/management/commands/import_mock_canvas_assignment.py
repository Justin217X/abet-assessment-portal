# File: import_mock_canvas_assignment.py
# Purpose: Imports assignment 501 through the mock Canvas facade.
# !!! Development only. No live Canvas access or sign-in account is created. [SD]

import json
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from integrations.assignment_import import store_canvas_assignment
from integrations.canvas_facade import get_mock_canvas_assignment
from integrations.models import CanvasCourse, ImportRun, SourceRecord


class Command(BaseCommand):
    help = 'Import fictional Canvas assignment 501 and print its saved version ID.'

    @transaction.atomic
    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError('Mock imports are available only in development.')

        payload = get_mock_canvas_assignment(501)
        course_path = Path(__file__).resolve().parents[3] / 'demo_data' / 'canvas_course.json'
        with course_path.open(encoding='utf-8') as fixture:
            course_data = json.load(fixture)
        if str(course_data['id']) != str(payload['course_id']):
            raise CommandError('The mock assignment and course do not match.')

        # Import history needs an owner. This inactive account cannot sign in.
        user, created = get_user_model().objects.get_or_create(
            username='portal-demo-importer', defaults={'is_active': False},
        )
        if created:
            user.set_unusable_password()
            user.save(update_fields=['password'])
        if user.is_active or user.is_staff or user.has_usable_password():
            raise CommandError('The demo import account must be inactive and unable to sign in.')

        source, _ = SourceRecord.objects.get_or_create(
            source_system='canvas', record_type='course', source_id=str(course_data['id']),
        )
        course, _ = CanvasCourse.objects.get_or_create(
            source_record=source, defaults={'display_name': course_data['name']},
        )
        run = ImportRun.objects.create(requested_by=user, import_kind='mock_canvas_assignment')
        version = store_canvas_assignment(payload, canvas_course=course, import_run=run)
        run.status = ImportRun.Status.COMPLETED
        run.finished_at = timezone.now()
        run.save(update_fields=['status', 'finished_at'])
        self.stdout.write(self.style.SUCCESS(f'Saved assignment version ID: {version.pk}'))
