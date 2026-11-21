# File: test_saved_rubric.py
# Purpose: Checks that the endpoint returns the requested saved rubric version.

from copy import deepcopy
from io import StringIO
import uuid

from django.core.management import call_command
from django.test import TestCase, override_settings
from django.urls import reverse

from .assignment_import import store_canvas_assignment
from .models import AssignmentVersion
from .rubric_preview import build_rubric_preview


@override_settings(DEBUG=True)
class SavedRubricEndpointTests(TestCase):
    def setUp(self):
        call_command('import_mock_canvas_assignment', stdout=StringIO())
        self.first = AssignmentVersion.objects.select_related(
            'assignment__canvas_course', 'source_revision__import_run',
        ).get()

    def url(self, version_id):
        return reverse('saved-assignment-rubric', kwargs={'version_id': version_id})

    def test_each_saved_version_returns_its_own_title_and_rubric(self):
        payload = deepcopy(self.first.source_revision.payload)
        payload['name'] = 'Revised assignment'
        payload['use_rubric_for_grading'] = False
        payload['rubric'][0]['long_description'] = 'Revised criterion description'
        payload['rubric'][0]['points'] = 25
        payload['rubric'][0]['ratings'][0]['points'] = 25
        second = store_canvas_assignment(
            payload,
            canvas_course=self.first.assignment.canvas_course,
            import_run=self.first.source_revision.import_run,
        )
        first_response = self.client.get(self.url(self.first.pk))
        second_response = self.client.get(self.url(second.pk))
        self.assertEqual(first_response.status_code, 200)
        self.assertEqual(second_response.status_code, 200)
        self.assertEqual(first_response.json(), build_rubric_preview(self.first))
        self.assertEqual(second_response.json(), build_rubric_preview(second))
        self.assertEqual(first_response.json()['assignment_title'], 'Demo Programming Assignment')
        self.assertEqual(second_response.json()['assignment_title'], 'Revised assignment')
        self.assertEqual(first_response.json()['criteria'][0]['ratings'][0]['points'], 20)
        self.assertEqual(second_response.json()['criteria'][0]['ratings'][0]['points'], 25)
        self.assertEqual(second_response['Cache-Control'], 'private, no-store')

    def test_unknown_version_returns_404(self):
        self.assertEqual(self.client.get(self.url(uuid.uuid4())).status_code, 404)

    def test_invalid_version_id_returns_404(self):
        self.assertEqual(
            self.client.get('/api/demo/assignment-versions/not-a-uuid/rubric/').status_code, 404,
        )

    def test_missing_rubric_returns_empty_criteria(self):
        self.first.source_revision.payload['rubric'] = []
        self.first.source_revision.save(update_fields=['payload'])
        response = self.client.get(self.url(self.first.pk))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['criteria'], [])

    def test_post_is_rejected(self):
        self.assertEqual(self.client.post(self.url(self.first.pk)).status_code, 405)

    @override_settings(DEBUG=False)
    def test_endpoint_is_disabled_outside_development(self):
        self.assertEqual(self.client.get(self.url(self.first.pk)).status_code, 404)
