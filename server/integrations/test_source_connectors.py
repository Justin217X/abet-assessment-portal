# File: test_source_connectors.py
# Purpose: Checks assignment and roster lookups against the shared mock dataset.

import json
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured
from django.test import SimpleTestCase, override_settings

from .source_connectors import canvas_connector, roster_connector


@override_settings(CANVAS_DATA_CONNECTOR='mock', ROSTER_DATA_CONNECTOR='mock')
class MockSourceConnectorTests(SimpleTestCase):
    def setUp(self):
        path = Path(__file__).resolve().parent.parent / 'demo_data' / 'portal_demo.json'
        self.data = json.loads(path.read_text(encoding='utf-8'))

    def test_assignment_lookup_preserves_response_and_does_not_share_mutations(self):
        expected = self.data['assignments'][0]
        connector = canvas_connector(self.data)
        result = connector.get_assignment(expected['course_id'], expected['id'])
        self.assertEqual(result, expected)
        result['name'] = 'Changed by caller'
        self.assertNotEqual(connector.get_assignment(expected['course_id'], expected['id'])['name'], result['name'])

    def test_wrong_course_or_unknown_assignment_is_rejected(self):
        row = self.data['assignments'][0]
        connector = canvas_connector(self.data)
        with self.assertRaises(LookupError):
            connector.get_assignment(-1, row['id'])
        with self.assertRaises(LookupError):
            connector.get_assignment(row['course_id'], -1)

    def test_roster_is_scoped_to_course_and_returns_independent_records(self):
        course_id = self.data['courses'][0]['id']
        connector = roster_connector(self.data)
        result = connector.get_roster(course_id)
        self.assertTrue(result)
        self.assertTrue(all(row['course_id'] == course_id for row in result))
        self.assertEqual(result, [row for row in self.data['enrollments'] if row['course_id'] == course_id])
        result[0]['status'] = 'changed'
        self.assertNotEqual(connector.get_roster(course_id)[0]['status'], 'changed')

    def test_unknown_roster_course_is_rejected(self):
        with self.assertRaises(LookupError):
            roster_connector(self.data).get_roster('not-a-course')

    def test_unimplemented_sources_do_not_silently_use_mock_data(self):
        with override_settings(CANVAS_DATA_CONNECTOR='live'):
            with self.assertRaises(ImproperlyConfigured):
                canvas_connector(self.data)
        with override_settings(ROSTER_DATA_CONNECTOR='live'):
            with self.assertRaises(ImproperlyConfigured):
                roster_connector(self.data)
