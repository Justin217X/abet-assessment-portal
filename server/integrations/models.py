import uuid

from django.db import models

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