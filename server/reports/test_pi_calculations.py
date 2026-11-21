# File: test_pi_calculations.py
# Purpose: Checks PI counts, score statistics, and excluded submissions.

from copy import deepcopy

from django.test import SimpleTestCase

from .pi_calculations import calculate_pi_statistics


class PiStatisticsTests(SimpleTestCase):
    def setUp(self):
        # Small test-only records; shared demo datasets remain in demo_data.
        self.criterion = {
            'id': 'criterion',
            'ratings': [
                {'id': 'beginning', 'description': 'Beginning', 'points': 5},
                {'id': 'developing', 'description': 'Developing', 'points': 10},
                {'id': 'proficient', 'description': 'Proficient', 'points': 15},
                {'id': 'exemplary', 'description': 'Exemplary', 'points': 20},
            ],
        }

    def submission(self, rating_id='proficient', points=15, **fields):
        return {
            'workflow_state': 'graded',
            'rubric_assessment': {'criterion': {'rating_id': rating_id, 'points': points}},
            **fields,
        }

    def test_distribution_percentages_and_score_statistics(self):
        submissions = [
            self.submission('beginning', 5),
            self.submission('developing', 10),
            self.submission('proficient', 15),
            self.submission('proficient', 15),
            self.submission('exemplary', 20),
        ]
        result = calculate_pi_statistics(self.criterion, submissions)
        self.assertEqual(result['total_students'], 5)
        self.assertEqual([row['student_count'] for row in result['distribution']], [1, 1, 2, 1])
        self.assertEqual([row['percentage'] for row in result['distribution']], [20, 20, 40, 20])
        self.assertEqual([row['average_score'] for row in result['distribution']], [5, 10, 15, 20])
        self.assertEqual(result['min_score'], 5)
        self.assertEqual(result['max_score'], 20)
        self.assertEqual(result['median_score'], 15)
        self.assertEqual(result['mean_score'], 13)
        self.assertEqual(result['mean_level'], 2.6)
        self.assertEqual(result['highest_supported_level'], 4)

    def test_missing_excused_ungraded_and_unscored_submissions_are_excluded(self):
        submissions = [
            self.submission(),
            self.submission(missing=True),
            self.submission(excused=True),
            self.submission(workflow_state='submitted'),
            self.submission(points=None),
            self.submission(rubric_assessment={}),
            self.submission(rubric_assessment=None),
        ]
        result = calculate_pi_statistics(self.criterion, submissions)
        self.assertEqual(result['total_students'], 1)
        self.assertEqual(result['mean_score'], 15)

    def test_zero_score_counts_as_a_valid_score(self):
        result = calculate_pi_statistics(self.criterion, [self.submission('beginning', 0)])
        self.assertEqual(result['total_students'], 1)
        self.assertEqual(result['min_score'], 0)
        self.assertEqual(result['mean_score'], 0)
        self.assertEqual(result['distribution'][0]['student_count'], 1)
        self.assertEqual(result['distribution'][0]['percentage'], 100)

    def test_empty_results_have_zero_counts_and_no_score_statistics(self):
        result = calculate_pi_statistics(self.criterion, [])
        self.assertEqual(result['total_students'], 0)
        for field in ['min_score', 'max_score', 'mean_score', 'median_score', 'mean_level']:
            self.assertIsNone(result[field])
        self.assertTrue(all(row['percentage'] == 0 and row['average_score'] is None for row in result['distribution']))

    def test_only_the_selected_criterion_is_counted_and_inputs_are_unchanged(self):
        submissions = [self.submission(), self.submission(rubric_assessment={
            'other': {'rating_id': 'exemplary', 'points': 20},
        })]
        original = deepcopy((self.criterion, submissions))
        self.assertEqual(calculate_pi_statistics(self.criterion, submissions)['total_students'], 1)
        self.assertEqual((self.criterion, submissions), original)
