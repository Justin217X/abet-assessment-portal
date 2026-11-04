from django.db import IntegrityError, transaction
from django.test import TestCase

from datetime import date
from .models import Course, Semester, CourseSection 


# Create your tests here.

# Check that course code remain unique. [SD]
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

        # Create a course section with a specific code. [SD]
        CourseSection.objects.create(
            course=course,
            semester=semester,
            section_code='001'
        )

        # Reject the same section for the same course and semester. [SD]
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                CourseSection.objects.create(
                    course=course,
                    semester=semester,
                    section_code='001'
                )