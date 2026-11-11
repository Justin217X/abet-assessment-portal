"""
File: models.py
Purpose: Defines source records, Canvas courses, import runs, assignments, and saved versions.
"""

import uuid

from django.db import models
from django.conf import settings
from django.utils import timezone

# Create your models here.

# Remember where an imported item originally came from. [SD]
class SourceRecord(models.Model):

    # Generate a unique internal identifier. [SD]
    source_record_id = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False,
        )

    # Store the source name, such as canvas or portal. [SD]
    source_system = models.CharField(max_length=50)

    # Store the item type, such as course or assignment. [SD]
    record_type= models.CharField(max_length=50)

    # Store the original identifier, including its scope when needed.  [SD]
    source_id = models.CharField(max_length=255)

    # Prevent duplicates of the same item from the same source. [SD]
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['source_system', 'record_type', 'source_id'], 
                name='unique_source_record'
                )
        ]

    # Display the source, item type, and original identifier. [SD]
    def __str__(self):
        return f'{self.source_system} / {self.record_type} / {self.source_id}'


# Store a Canvas course separately from the university's course catalog. [SD]
class CanvasCourse(models.Model):

    # Generate a unique internal identifier for the Canvas course. [SD]
    canvas_course_id = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False,
        )

    # Link to one source record and prevent duplicate Canvas course entries. [SD]
    source_record = models.OneToOneField(
        SourceRecord, 
        on_delete=models.PROTECT,
        related_name='canvas_courses',
        )

    # Store the course name shown in Canvas. [SD]
    display_name = models.CharField(max_length=255)

    # Display the Canvas course using its original identifier. [SD]
    def __str__(self):
        return self.display_name

# Keep one assignment record even when its title or instructions change. [SD]
class Assignment(models.Model):

    # Generate a unique internal identifier for the assignment. [SD]
    assignment_id = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False,
        )

    # A Canvas course can contain multiple assignments. [SD]
    canvas_course = models.ForeignKey(
        CanvasCourse, 
        on_delete=models.PROTECT,
        related_name='assignments',
        )

    # Give each assignment one unique source record. [SD]
    source_record = models.OneToOneField(
        SourceRecord, 
        on_delete=models.PROTECT,
        related_name='assignments',
        )

# Record who requested and import, when it ran, and how it ended. [SD]
class ImportRun(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PARTIAL = 'partial', 'Partial'
        FAILED = 'failed', 'Failed'
        COMPLETED = 'completed', 'Completed'

    import_run_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    # Keep the requesting user linked to the import history. [SD]
    requested_by = models.ForeignKey( 
        settings.AUTH_USER_MODEL, 
        on_delete=models.PROTECT,
        related_name='import_runs',
    )

    import_kind = models.CharField(max_length=50)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    started_at = models.DateTimeField(default=timezone.now)
    finished_at = models.DateTimeField(null=True, blank=True)
    validation_summary = models.JSONField(null=True, blank=True)   

# Keep a snapshot of the Canvas data received during an import. [SD]
class SourceRevision(models.Model):
    source_revision_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    # Link each snapshot to the original item and the import that retrieved it. [SD]
    source_record = models.ForeignKey(
        SourceRecord,
        on_delete=models.PROTECT,
        related_name='revisions',
    )

    import_run = models.ForeignKey(
        ImportRun,
        on_delete=models.PROTECT,
        related_name='source_revisions',
    )

    revision_number = models.PositiveIntegerField()
    retrieved_at = models.DateTimeField()
    payload = models.JSONField()

    class Meta:
        constraints = [
            # Start revisions numbers at 1 and prevent duplicates for the same item. [SD]
            models.CheckConstraint(
                condition=models.Q(revision_number__gte=1),
                name='source_revision_number_at_least_1'
            ),
            models.UniqueConstraint(
                fields=['source_record', 'revision_number'],
                name='unique_source_record_revision_number'
            ),

        ]

# Preserve the assignment title and instructions from one source revision. [SD]
class AssignmentVersion(models.Model):
    assignment_version_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    # Link each assignment version to the original assignment and the source revision that created it. [SD]
    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.PROTECT,
        related_name='versions',
    )

    # Store at most one assignment version for each source revision. [SD]
    source_revision = models.OneToOneField(
        SourceRevision,
        on_delete=models.PROTECT,
        related_name='assignment_versions',
    )

    title = models.TextField()

    # Canvas may return no instructions for an assignment. [SD]
    instructions = models.TextField(null=True, blank=True)    
