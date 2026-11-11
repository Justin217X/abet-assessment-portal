"""
File: test.py
Purpose: Test the rules for course, semesters, and sections.
"""

from django.db import IntegrityError, transaction
from django.test import TestCase

from datetime import date
from .models import Course, Semester, CourseSection 

from integrations.models import CanvasCourse, SourceRecord

# Check that course codes remain unique. [SD]
class CourseModelTestCase(TestCase):
    def test_duplicate_course_code_is_rejected(self):
        # Create a course with a specific course code. [SD]
        Course.objects.create(
             course_code='DEMO 101', 
             title='Example Course'
             )

        # A second course cannot use the same code. [SD]
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Course.objects.create(
                     course_code='DEMO 101', 
                     title='Another Example',
                     )


# Check that semester dates are in the correct order. [SD]
class SemesterTests(TestCase):
    def test_end_date_before_start_date_is_rejected(self):
        # The database must reject a semester that ends before it starts. [SD]
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Semester.objects.create(
                    semester_code='DEMO-2026',
                    starts_on=date(2026, 12, 1),
                    ends_on=date(2026, 9, 1),
                )

# Check that a course section cannot be duplicated. [SD]
class CourseSectionTests(TestCase):
    def test_duplicate_course_section_is_rejected(self):
        
        # Create a course and semester for the section. [SD]
        course = Course.objects.create(
            course_code='DEMO 101',
            title='Example Course'
        )
        semester = Semester.objects.create(
            semester_code='DEMO-2026',
            starts_on=date(2026, 9, 1),
            ends_on=date(2026, 12, 1)
        )

        # Create the first section. [SD]
        CourseSection.objects.create(
            course=course,
            semester=semester,
            section_code='001'
        )

        # Reject a duplicate section for the same course and semester. [SD]
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                CourseSection.objects.create(
                    course=course,
                    semester=semester,
                    section_code='001'
                )

    # Allow multiple university sections to share one Canvas course. [SD]
    def test_sections_can_share_canvas_course(self):
        source = SourceRecord.objects.create(
             source_system='canvas',
             record_type='course',
             source_id='demo-course-001',
        )
        canvas_course = CanvasCourse.objects.create(
            source_record=source,
            display_name='Example Combined Course',
        )
        course = Course.objects.create(
            course_code='DEMO 101',
            title='Example Course'
        )
        semester = Semester.objects.create(
            semester_code='DEMO-2026',
            starts_on=date(2026, 9, 1),
            ends_on=date(2026, 12, 1)
        )

        # Link two different sections to the same Canvas course. [SD]
        for code in ['001', '002']:
            CourseSection.objects.create(
                course=course,
                semester=semester,
                section_code=code,
                canvas_course=canvas_course
            )

        self.assertEqual(canvas_course.sections.count(), 2)

    # Check that a section can exist without a Canvas course. [SD]
    def test_section_can_have_no_canvas_course(self):
        course = Course.objects.create(
            course_code='DEMO 101',
            title='Example Course'
        )
        semester = Semester.objects.create(
            semester_code='DEMO-2026',
            starts_on=date(2026, 9, 1),
            ends_on=date(2026, 12, 1)
        )

        # Create a section without a Canvas course. [SD]
        section = CourseSection.objects.create(
            course=course,
            semester=semester,
            section_code='001'
        )

        # Confirm the missing link remains empty after saving. [SD]
        section.refresh_from_db()
        self.assertIsNone(section.canvas_course_id)