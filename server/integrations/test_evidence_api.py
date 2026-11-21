# File: test_evidence_api.py
# Purpose: Checks evidence choices returned by the shared dashboard API.

import json
from pathlib import Path
from unittest.mock import patch

from django.test import TestCase, override_settings
from django.urls import reverse


@override_settings(DEBUG=True, PORTAL_DATA_PROVIDER='mock', CANVAS_DATA_CONNECTOR='mock', ROSTER_DATA_CONNECTOR='mock')
class EvidenceApiTests(TestCase):
    def setUp(self):
        self.path = Path(__file__).resolve().parent.parent / 'demo_data' / 'portal_demo.json'
        self.source_bytes = self.path.read_bytes()
        self.source = json.loads(self.source_bytes)

    def response_data(self):
        response = self.client.get(reverse('demo-portal-data'))
        self.assertEqual(response.status_code, 200)
        return response.json()

    def test_api_returns_choices_with_assessment_score_feedback_and_flags(self):
        data = self.response_data()
        assessments = {row['id']: row for row in data['assessments']}
        choices = data['evidence']
        self.assertGreater(len(choices), len(self.source['evidence']))
        for row in choices:
            self.assertIn(row['assessment_id'], assessments)
            for field in ['criterion_score', 'criterion_max', 'instructor_feedback', 'eligible', 'suggested']:
                self.assertIn(field, row)
            self.assertIsInstance(row['eligible'], bool)
            self.assertIsInstance(row['suggested'], bool)
            if row['eligible']:
                task = assessments[row['assessment_id']]
                group = next(g for g in data['student_groups'] if g['id'] == task['student_group_id'])
                self.assertIn(row['student_id'], group['student_ids'])
                self.assertTrue(any(
                    e['student_id'] == row['student_id'] and e['course_id'] == task['course_id'] and
                    e['status'] == 'active' and e['match_status'] == 'matched'
                    for e in data['enrollments']
                ))
        self.assertEqual({row['id'] for row in self.source['evidence']} - {row['id'] for row in choices}, set())

    def test_choices_are_repeatable_and_do_not_modify_fixture_or_original_selection(self):
        first = self.response_data()
        second = self.response_data()
        self.assertEqual(first['evidence'], second['evidence'])
        self.assertEqual(self.path.read_bytes(), self.source_bytes)
        existing = {row['id']: row for row in self.source['evidence']}
        for row in first['evidence']:
            if row['id'] in existing:
                self.assertEqual(row['selected'], existing[row['id']]['selected'])
            else:
                self.assertFalse(row['selected'])
                self.assertFalse(row['file_available'])

    def test_each_assessment_has_its_own_choices(self):
        data = self.response_data()
        first, second = data['assessments'][:2]
        first_ids = {e['id'] for e in data['evidence'] if e['assessment_id'] == first['id']}
        second_ids = {e['id'] for e in data['evidence'] if e['assessment_id'] == second['id']}
        self.assertTrue(first_ids)
        self.assertTrue(second_ids)
        self.assertTrue(first_ids.isdisjoint(second_ids))

    @override_settings(DEBUG=False)
    def test_choices_are_not_loaded_outside_development(self):
        with patch('integrations.dashboard_data.build_evidence_candidates') as builder:
            self.assertEqual(self.client.get(reverse('demo-portal-data')).status_code, 404)
        builder.assert_not_called()
