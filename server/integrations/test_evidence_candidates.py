# File: test_evidence_candidates.py
# Purpose: Checks mock evidence eligibility, suggestions, and shared text templates.

from copy import deepcopy
import json
from pathlib import Path
from statistics import median

from django.test import SimpleTestCase

from .evidence_candidates import build_evidence_candidates
from .source_connectors import MockRosterConnector


class EvidenceCandidateTests(SimpleTestCase):
    def setUp(self):
        self.folder = Path(__file__).resolve().parent.parent / 'demo_data'
        self.data = json.loads((self.folder / 'portal_demo.json').read_text(encoding='utf-8'))
        self.task = self.data['assessments'][0]
        self.data['assessments'] = [self.task]

    def choices(self):
        return build_evidence_candidates(self.data, MockRosterConnector(self.data))

    def test_preserves_input_and_existing_evidence_ids_without_selecting_new_examples(self):
        original = deepcopy(self.data)
        rows = self.choices()
        self.assertEqual(self.data, original)
        old = {row['id']: row for row in original['evidence'] if row['assessment_id'] == self.task['id']}
        self.assertTrue(set(old).issubset({row['id'] for row in rows}))
        for row in rows:
            if row['id'] in old:
                self.assertEqual(row['selected'], old[row['id']]['selected'])
            else:
                self.assertFalse(row['selected'])
                self.assertFalse(row['file_available'])

    def test_ungraded_missing_and_excused_submissions_are_not_eligible(self):
        baseline = deepcopy(self.data)
        for field, value in [('workflow_state', 'submitted'), ('missing', True), ('excused', True)]:
            with self.subTest(field=field):
                self.data = deepcopy(baseline)
                for submission in self.data['submissions']:
                    submission[field] = value
                rows = self.choices()
                self.assertTrue(rows)
                self.assertFalse(any(row['eligible'] or row['suggested'] for row in rows))

    def test_inactive_unmatched_or_outside_group_students_are_not_eligible(self):
        baseline = deepcopy(self.data)
        for reason in ['inactive', 'unmatched', 'outside_group']:
            with self.subTest(reason=reason):
                self.data = deepcopy(baseline)
                if reason == 'outside_group':
                    next(g for g in self.data['student_groups'] if g['id'] == self.task['student_group_id'])['student_ids'] = []
                else:
                    for enrollment in self.data['enrollments']:
                        if enrollment['course_id'] == self.task['course_id']:
                            enrollment['status' if reason == 'inactive' else 'match_status'] = reason
                self.assertFalse(any(row['eligible'] for row in self.choices()))

    def test_zero_score_remains_eligible(self):
        student = self.data['students'][0]
        submission = next(row for row in self.data['submissions'] if
            row['assignment_id'] == self.task['assignment_id'] and row['user_id'] == student['canvas_user_id'])
        submission['rubric_assessment'][self.task['criterion_id']]['points'] = 0
        rows = [row for row in self.choices() if row['student_id'] == student['id']]
        self.assertTrue(rows)
        self.assertTrue(all(row['eligible'] and row['criterion_score'] == 0 for row in rows))

    def test_missing_criterion_has_no_eligible_choices(self):
        self.task['criterion_id'] = 'not-a-criterion'
        self.assertFalse(any(row['eligible'] for row in self.choices()))

    def test_suggestions_use_high_low_and_nearest_median_without_automatic_selection(self):
        rows = self.choices()
        scores = {row['student_id']: row['criterion_score'] for row in rows if row['eligible']}
        midpoint = median(scores.values())
        for band in ['high', 'middle', 'low']:
            suggested = [row for row in rows if row['band'] == band and row['suggested']]
            self.assertEqual(len(suggested), 1)
            row = suggested[0]
            self.assertTrue(row['eligible'])
            if band == 'high':
                self.assertEqual(row['criterion_score'], max(scores.values()))
            elif band == 'low':
                self.assertEqual(row['criterion_score'], min(scores.values()))
            else:
                self.assertEqual(abs(row['criterion_score'] - midpoint), min(abs(score - midpoint) for score in scores.values()))

    def test_generated_text_comes_from_shared_template(self):
        row = next(row for row in self.choices() if '-candidate-' in row['id'])
        template = json.loads((self.folder / 'evidence_templates.json').read_text(encoding='utf-8'))
        student = next(s for s in self.data['students'] if s['id'] == row['student_id'])
        version = next(v for v in self.data['assignment_versions'] if v['id'] == self.task['assignment_version_id'])
        expected = template['content_template'].format(
            student_label=student['display_label'], assignment_title=version['payload']['name'],
            score=row['criterion_score'], criterion_max=row['criterion_max'],
        )
        self.assertEqual(row['content'], expected)
        self.assertFalse(row['file_available'])
        self.assertEqual(row['media_type'], 'text/plain')
