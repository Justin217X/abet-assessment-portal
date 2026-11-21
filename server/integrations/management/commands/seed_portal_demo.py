# File: seed_portal_demo.py
# Purpose: Loads fictional demo records into the local Django database.
#
# Read demo input files from server/demo_data.
# Keep this file in integrations/management/commands so Django can find it.
# Run from the repository folder:
# python server/manage.py seed_portal_demo
#
# !!! This command runs only when DEBUG=True. [SD]
# !!! Use it only with a development or test database. [SD]
# !!! Keep it for testing when live university connections are added. [SD]

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from academics.models import Course, CourseSection, Semester
from integrations.assignment_import import store_canvas_assignment
from integrations.models import CanvasCourse, ImportRun, SourceRecord, SourceRevision
from integrations.portal_data import DATASET_SOURCE_ID, MockPortalProvider


class Command(BaseCommand):
    help = 'Save the shared fictional dataset and import supported course/assignment models.'

    def add_arguments(self, parser):
        parser.add_argument('--username', help='Optional existing local user to own the import history.')

    @transaction.atomic
    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError('Demo imports are available only in development.')
        if options['username']:
            user = get_user_model().objects.filter(username=options['username']).first()
            if user is None:
                raise CommandError('The specified local user does not exist.')
        else:

            # ImportRun needs an owner. This bookkeeping actor cannot sign in.
            user, created = get_user_model().objects.get_or_create(
                username='portal-demo-importer', defaults={'is_active': False},
            )
            if created:
                user.set_unusable_password()
                user.save(update_fields=['password'])
            if user.is_active or user.is_staff or user.has_usable_password():
                raise CommandError('The demo importer name is already used by another account.')
        data = MockPortalProvider().load()

        # Lock the shared source record so two imports do not run over each other.
        source, _ = SourceRecord.objects.get_or_create(
            source_system='portal_demo', record_type='dataset', source_id=DATASET_SOURCE_ID,
        )
        source = SourceRecord.objects.select_for_update().get(pk=source.pk)
        latest = source.revisions.order_by('-revision_number').first()
        if latest is not None and latest.payload == data:
            self.stdout.write('Demo data is already saved; no new records or versions created.')
            return
        run = ImportRun.objects.create(requested_by=user, import_kind='portal_demo')
        semesters = {}
        for row in data['semesters']:
            semesters[row['id']], _ = Semester.objects.get_or_create(
                semester_code=row['code'],
                defaults={'starts_on': row['starts_on'], 'ends_on': row['ends_on']},
            )
        courses = {}
        for row in data['courses']:
            record, _ = SourceRecord.objects.get_or_create(
                source_system='canvas', record_type='course', source_id=str(row['canvas_id']),
            )
            canvas_course, _ = CanvasCourse.objects.get_or_create(
                source_record=record, defaults={'display_name': row['name']},
            )
            course, _ = Course.objects.get_or_create(
                course_code=row['course_code'], defaults={'title': row['name']},
            )
            courses[row['id']] = canvas_course
            for section in data['sections']:
                if section['course_id'] == row['id']:
                    saved_section, _ = CourseSection.objects.get_or_create(
                        course=course, semester=semesters[row['semester_id']],
                        section_code=section['section_code'], defaults={'canvas_course': canvas_course},
                    )
                    if saved_section.canvas_course_id != canvas_course.pk:
                        raise CommandError('A demo section conflicts with an existing Canvas course; transaction rolled back.')
        source_courses = {c['canvas_id']: courses[c['id']] for c in data['courses']}
        for version in sorted(data['assignment_versions'], key=lambda v: (v['assignment_id'], v['revision_number'])):
            payload = version['payload']

            # Reuse saved versions when the command runs again.
            existing = SourceRevision.objects.filter(
                source_record__source_system='canvas', source_record__record_type='assignment',
                source_record__source_id=str(payload['id']), payload=payload,
            ).exists()
            if not existing:
                store_canvas_assignment(payload, canvas_course=source_courses[payload['course_id']], import_run=run)
        SourceRevision.objects.create(
            source_record=source, import_run=run,
            revision_number=1 if latest is None else latest.revision_number + 1,
            retrieved_at=timezone.now(), payload=data,
        )
        run.status = ImportRun.Status.COMPLETED
        run.finished_at = timezone.now()
        run.save(update_fields=['status', 'finished_at'])
        self.stdout.write(self.style.SUCCESS('Saved demo dataset, courses, sections, and assignment versions.'))
