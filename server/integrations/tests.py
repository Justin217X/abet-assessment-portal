import json

from pathlib import Path
from django.db import IntegrityError, transaction
from django.test import TestCase
from .models import SourceRecord, CanvasCourse


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