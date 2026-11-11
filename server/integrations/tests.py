"""
File: tests.py
Purpose: Test the integration models and checks that the fictional Canvas responses can be read.
"""

import json

from pathlib import Path
from django.db import IntegrityError, transaction
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import SourceRecord, CanvasCourse
from .models import Assignment, AssignmentVersion, ImportRun, SourceRevision
from .assignment_import import store_canvas_assignment


# Check that source records are not duplicated. [SD]
class SourceRecordTests(TestCase):
    def test_duplicate_source_record_is_rejected(self):
        # Use a fictional source identifier. [SD]
        SourceRecord.objects.create(
            source_system='canvas',
            record_type='course',
            source_id='demo-course-001',
        )

        # Reject the same source, item type, and identifier. [SD]
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                SourceRecord.objects.create(
                    source_system='canvas',
                    record_type='course',
                    source_id='demo-course-001',
                )

    # A course and an assignment may have the same source ID. [SD]
    def test_same_id_for_different_record_types_is_allowed(self):
        course = SourceRecord.objects.create(
            source_system='canvas',
            record_type='course',
            source_id='demo-001',
        )

        assignment = SourceRecord.objects.create(
            source_system='canvas',
            record_type='assignment',
            source_id='demo-001',
        )

        # Keep them as separate internal records. [SD]
        self.assertNotEqual(
            course.source_record_id,
            assignment.source_record_id,
        )
        self.assertEqual(SourceRecord.objects.count(), 2)


# Check that each Canvas course has its own source record. [SD]
class CanvasCourseTests(TestCase):
    def test_duplicate_source_record_is_rejected(self):
        source = SourceRecord.objects.create(
            source_system='canvas',
            record_type='course',
            source_id='demo-course-001',
        )

        CanvasCourse.objects.create(
            source_record=source,
            display_name='Example Course',
        )

        # Reject another Canvas course linked to the same source record. [SD]
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                CanvasCourse.objects.create(
                    source_record=source,
                    display_name='Duplicate Example',
                )

# Check that the fictional Canvas response is ready for import test. [SD]
class CanvasAssignmentFixturesTests(TestCase):
    def test_fixture_contains_a_grading_rubtic(self):
        # Find the JSON file next to this test module. [SD]
        fixture_path = ( 
            Path(__file__).parent / 'test_data' / 'canvas_assignment_with_rubric.json' 
        )

        with fixture_path.open(encoding='utf-8') as fixture:
            assignment = json.load(fixture)

            # Check the grading flag, criterion, and rating options. [SD]
            self.assertIs(assignment['use_rubric_for_grading'], True)
            self.assertEqual(len(assignment['rubric']), 1)
            self.assertEqual(len(assignment['rubric'][0]['ratings']), 4)


# Check that an assignment version retains its source and instructions. [SD]
class AssignmentVersionTest(TestCase):
    def test_saves_first_version_from_canvas_fixture(self):
        fixture_path = (
            Path(__file__).parent / 'test_data' / 'canvas_assignment_with_rubric.json'            
        )
        with fixture_path.open(encoding='utf-8') as fixture:
            payload = json.load(fixture)

        # Use a fixtional requestyed and record the import. [SD]
        requester = get_user_model().objects.create_user(username='demo-importer')

        import_run = ImportRun.objects.create(
            requested_by=requester,
            import_kind='canvas',
            status=ImportRun.Status.COMPLETED,
            finished_at=timezone.now(),
        )

        course_source = SourceRecord.objects.create(
            source_system='canvas',
            record_type='course',
            source_id=payload['course_id'],
        )

        canvas_course = CanvasCourse.objects.create(
            source_record=course_source,
            display_name='Demo Course',
        )

        assignment_source = SourceRecord.objects.create(
            source_system='canvas',
            record_type='assignment',
            source_id=payload['id'],
        )

        assignment = Assignment.objects.create(
            canvas_course=canvas_course,
            source_record=assignment_source,
        )

        # Save the original response and the fields the portal needs. [SD]
        revision = SourceRevision.objects.create(
            source_record=assignment_source,
            import_run=import_run,
            revision_number=1,
            retrieved_at=timezone.now(),
            payload=payload,
        )

        AssignmentVersion.objects.create(
            assignment=assignment,
            source_revision=revision,
            title=payload['name'],
            instructions=payload['description'],
        )

        # Read the saved version back from the database. [SD]\
        saved_version = assignment.versions.get()
        self.assertEqual(saved_version.title, payload['name'])
        self.assertEqual(saved_version.instructions, payload['description'])
        self.assertEqual(saved_version.source_revision.payload, payload)
        self.assertEqual(saved_version.source_revision.import_run_id, import_run.pk)

    def test_reimport_preserves_assignment_history(self):
        fixture_path = (
            Path(__file__).parent / 'test_data' / 'canvas_assignment_with_rubric.json'
        )
        with fixture_path.open(encoding='utf-8') as fixture:
            payload = json.load(fixture)

        requester = get_user_model().objects.create_user(username='demo-importer')
        course_source = SourceRecord.objects.create(
            source_system='canvas',
            record_type='course',
            source_id=str(payload['course_id']),
        )
        canvas_course = CanvasCourse.objects.create(
            source_record=course_source,
            display_name='Demo Course',
        )

        # Record each simulated retrieval separately. [SD]
        def save_response(response):
            import_run = ImportRun.objects.create(
                requested_by=requester,
                import_kind='canvas',
                status=ImportRun.Status.COMPLETED,
                finished_at=timezone.now(),
            )
            return store_canvas_assignment(
                response,
                canvas_course=canvas_course,
                import_run=import_run,
            )

        first = save_response(payload)
        repeated = save_response(payload)

        self.assertEqual(repeated.pk, first.pk)
        self.assertEqual(AssignmentVersion.objects.count(), 1)

        updated = {**payload, 'description': '<p>Updated test instructions.</p>'}
        second = save_response(updated)

        self.assertEqual(Assignment.objects.count(), 1)
        self.assertEqual(second.assignment_id, first.assignment_id)
        self.assertEqual(second.source_revision.revision_number, 2)
        self.assertEqual(second.instructions, updated['description'])
        self.assertEqual(AssignmentVersion.objects.count(), 2)

        first.refresh_from_db()
        self.assertEqual(first.instructions, payload['description'])