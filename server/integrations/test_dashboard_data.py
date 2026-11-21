# File: test_dashboard_data.py
# Purpose: Checks saved-version and roster rules used to prepare dashboard results.

from copy import deepcopy

from django.test import SimpleTestCase, override_settings

from .dashboard_data import load_dashboard_data, prepare_dashboard_data
from .portal_data import MockPortalProvider


@override_settings(PORTAL_DATA_PROVIDER='mock', CANVAS_DATA_CONNECTOR='mock', ROSTER_DATA_CONNECTOR='mock')
class DashboardDataTests(SimpleTestCase):
    def setUp(self):
        self.data = MockPortalProvider().load()

    def test_prepares_all_assessments_without_changing_input(self):
        original = deepcopy(self.data)
        result = prepare_dashboard_data(self.data)
        self.assertEqual(self.data, original)
        self.assertEqual(set(result['statistics']), {a['id'] for a in self.data['assessments']})
        self.assertEqual(result['assignments'], self.data['assignments'])
        first = result['statistics']['assessment-1']
        self.assertEqual(first['total_students'], 20)
        self.assertEqual(first['mean_score'], 14.25)

    def test_newer_unselected_version_does_not_change_selected_results(self):
        original = prepare_dashboard_data(self.data)['statistics']
        selected_versions = {a['assignment_version_id'] for a in self.data['assessments']}
        unselected = next(v for v in self.data['assignment_versions'] if v['id'] not in selected_versions)
        unselected['payload']['rubric'] = []
        self.assertEqual(prepare_dashboard_data(self.data)['statistics'], original)

    def test_inactive_and_unmatched_rosters_are_excluded(self):
        task = self.data['assessments'][0]
        for row in self.data['enrollments']:
            if row['course_id'] == task['course_id']:
                row['status'] = 'inactive'
        self.assertEqual(prepare_dashboard_data(self.data)['statistics'][task['id']]['total_students'], 0)
        for row in self.data['enrollments']:
            if row['course_id'] == task['course_id']:
                row['status'] = 'active'
                row['match_status'] = 'unmatched'
        self.assertEqual(prepare_dashboard_data(self.data)['statistics'][task['id']]['total_students'], 0)

    def test_selected_group_limits_counted_students(self):
        task = self.data['assessments'][0]
        group = next(g for g in self.data['student_groups'] if g['id'] == task['student_group_id'])
        group['student_ids'] = []
        self.assertEqual(prepare_dashboard_data(self.data)['statistics'][task['id']]['total_students'], 0)

    def test_missing_selected_criterion_has_no_statistics(self):
        task = self.data['assessments'][0]
        task['criterion_id'] = 'not-a-criterion'
        self.assertIsNone(prepare_dashboard_data(self.data)['statistics'][task['id']])

    def test_loader_uses_configured_shared_provider(self):
        result = load_dashboard_data()
        self.assertEqual(len(result['statistics']), len(result['assessments']))
        self.assertIn('current_date', result['metadata'])
