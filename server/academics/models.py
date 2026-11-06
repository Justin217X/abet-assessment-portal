import uuid

from django.db import models

# Store course information separately from semester sections. [SD]
class Course(models.Model):
    # Generate a unique internal identifier for each course. [SD]
    course_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False,)

    # Prevent two courses from having the same course code. [SD]
    course_code = models.CharField(max_length=32, unique=True)

    # Store the course's full name. [SD]
    title = models.CharField(max_length=255)

    # Store courses in order by course code. [SD]
    class Meta:
        ordering = ['course_code']

        # Prevent empty course cvodes and titles. [SD]
        constraints = [
            models.CheckConstraint(condition=~models.Q(course_code=''), name='course_code_not_empty'),
            models.CheckConstraint(condition=~models.Q(title=''), name='course_title_not_empty'),
        ]

    # Use a readable label when displaying a course. [SD]
    def __str__(self):
        return f'{self.course_code}: {self.title}'

# Store semester codes and calendar dates. [SD]
class Semester(models.Model):
    # Generate a unique internal identifier for each semester. [SD]
    semester_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False,)

    # Prevent duplicate semester codes, such as FALL-2026. [SD]
    semester_code = models.CharField(max_length=32, unique=True)

    # Store the semester's start and end dates. [SD]
    starts_on = models.DateField()
    ends_on = models.DateField()

    # Display semester by start date, then code. [SD]
    class Meta:
        ordering = ['starts_on', 'semester_code']

        constraints = [
            # Prevent an empty semester code. [SD]
            models.CheckConstraint(condition=~models.Q(semester_code=''), name='semester_code_not_empty'),

            # Prevent the semester from ending before it starts. [SD]
            models.CheckConstraint(
                condition=models.Q(ends_on__gte=models.F('starts_on')),
                name='semester_dates_in_order',
            ),
        ]
    # Display the semester using its code. [SD]
    def __str__(self):
        return self.semester_code

# Connect a course to a semester and section number. [SD]
class CourseSection(models.Model):
    section_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Keep courses and semesters that are still used by a section.
    course = models.ForeignKey(Course, on_delete=models.PROTECT, related_name='sections')
    semester = models.ForeignKey(Semester, on_delete=models.PROTECT, related_name='sections')

    # Link the section to its Canvas course when available. [SD]
    canvas_course = models.ForeignKey(
        'integrations.CanvasCourse',
        on_delete=models.PROTECT,
        related_name='sections',
        null=True,
        blank=True,
    )

    # Text preserves leading zeros, such as 001. [SD]
    section_code = models.CharField(max_length=32)

    # Text preserves leading zeros, such as 001.
    section_code = models.CharField(max_length=32)

    # Display sections by course, semester date, and section code. [SD]
    class Meta:
        ordering = ['course__course_code', 'semester__starts_on', 'section_code']

        # Require a section code and prevent duplicates within the same course and semester. [SD]
        constraints = [
            models.CheckConstraint(condition=~models.Q(section_code=''), name='section_code_not_empty'),
            models.UniqueConstraint(
                fields=['course', 'semester', 'section_code'],
                name='unique_course_semester_section',
            ),
        ]
    # Display the course, semester, and section together. [SD]
    def __str__(self):
        return f'{self.course.course_code} / {self.semester.semester_code} / {self.section_code}'
