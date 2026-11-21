# File: test_canvas_facade.py
# Purpose: Checks mock assignment lookup, rubric data, and unknown IDs.

import json
from pathlib import Path

from django.test import SimpleTestCase

from .canvas_facade import get_mock_canvas_assignment


class MockCanvasAssignmentFacadeTests(SimpleTestCase):
    def test_assignment_501_returns_the_complete_existing_response(self):
        fixture_path = (
            Path(__file__).resolve().parent.parent
            / 'demo_data'
            / 'canvas_assignment_with_rubric.json'
        )
        with fixture_path.open(encoding='utf-8') as fixture:
            expected = json.load(fixture)

        assignment = get_mock_canvas_assignment(501)

        self.assertEqual(assignment, expected)
        self.assertEqual(assignment['name'], 'Demo Programming Assignment')
        self.assertTrue(assignment['use_rubric_for_grading'])
        self.assertEqual(len(assignment['rubric']), 1)
        self.assertEqual(
            [rating['points'] for rating in assignment['rubric'][0]['ratings']],
            [20, 15, 10, 5],
        )
        self.assertEqual(
            [rating['description'] for rating in assignment['rubric'][0]['ratings']],
            ['Exemplary', 'Proficient', 'Developing', 'Beginning'],
        )

    def test_string_assignment_id_is_supported(self):
        self.assertEqual(get_mock_canvas_assignment('501')['id'], 501)

    def test_unknown_id_returns_clear_not_found_error(self):
        with self.assertRaisesRegex(LookupError, 'Canvas assignment not found'):
            get_mock_canvas_assignment(999999)

    def test_changing_one_response_does_not_change_the_next(self):
        assignment = get_mock_canvas_assignment(501)
        assignment['rubric'][0]['ratings'][0]['points'] = -1
        self.assertEqual(
            get_mock_canvas_assignment(501)['rubric'][0]['ratings'][0]['points'],
            20,
        )
