# File: source_connectors.py
# Purpose: Provides replaceable connections for Canvas assignments and course rosters.
#
# Current connections read fictional records from the supplied dataset.
#
# !!! Only mock connections work. [SD]
# !!! TODO:
# - Add a live Canvas connection using the approved access method.
# - Add a roster connection using the source Penn State approves.
# - Convert live responses into the field names the portal expects.
# - Add the new choices to canvas_connector and roster_connector below.
# - Test failed requests, missing records, and expired access.
# [SD]
# !!! Changing the settings alone will not create a live connection. [SD]
# !!! Penn State SSO is separate from permission to retrieve source data. [SD]

# Keep source-data connections separate from portal sign-in.
from copy import deepcopy
from typing import Protocol

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

# Define what every Canvas connection must provide.
class CanvasConnector(Protocol):
    def get_assignment(self, course_id: int, assignment_id: int) -> dict:
        # Return a Canvas-shaped assignment, or raise LookupError.
        ...

# Define what every roster connection must provide.
class RosterConnector(Protocol):
    def get_roster(self, course_id: str) -> list[dict]:
        # Return normalized enrollment records for a portal course ID.
        ...

# Find assignments in the fictional dataset.
class MockCanvasConnector:
    def __init__(self, dataset):
        self.dataset = dataset

    def get_assignment(self, course_id, assignment_id):
        for assignment in self.dataset['assignments']:
            if assignment['course_id'] == course_id and assignment['id'] == assignment_id:

                # Return a separate copy so callers do not change the original demo records.
                return deepcopy(assignment)
        raise LookupError('Assignment not found in the selected mock course.')

# Find course enrollments in the fictional dataset
class MockRosterConnector:
    def __init__(self, dataset):
        self.dataset = dataset

    def get_roster(self, course_id):
        if not any(course['id'] == course_id for course in self.dataset['courses']):
            raise LookupError('Course not found in the mock roster source.')

        # Return a separate copy so callers do not change the original demo records.
        return deepcopy([row for row in self.dataset['enrollments'] if row['course_id'] == course_id])


# Choose the Canvas connection named in settings.py.
# !!! Add the live connection here after implementing it. [SD]
def canvas_connector(dataset) -> CanvasConnector:
    if settings.CANVAS_DATA_CONNECTOR != 'mock':
        raise ImproperlyConfigured('This Canvas connector is not implemented yet.')
    return MockCanvasConnector(dataset)


# Choose the roster connection named in settings.py.
# !!! The approved roster source and access method still need confirmation. [SD]
def roster_connector(dataset) -> RosterConnector:
    if settings.ROSTER_DATA_CONNECTOR != 'mock':
        raise ImproperlyConfigured('This roster connector is not implemented yet.')
    return MockRosterConnector(dataset)
