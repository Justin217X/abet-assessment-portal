# File: test_demo_assignments.py
# Purpose: Tests demo work assignments and preservation of existing records.
import copy
from datetime import date, timedelta
from io import StringIO
from unittest.mock import patch

from django.core.management import call_command
from django.test import TestCase, override_settings

from .models import SourceRevision
from .portal_data import DATASET_PATH, MockPortalProvider, PortalDataFacade


@override_settings(DEBUG=True, PORTAL_DATA_PROVIDER='saved_mock')
class DemoAssignmentTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command('seed_portal_demo', stdout=StringIO())

    def setUp(self):
        self.data = MockPortalProvider().load()
        self.template = self.data['assessments'][0]
        self.semester = next(row for row in self.data['semesters'] if row['id'] == self.template['semester_id'])
        self.payload = {key: self.template[key] for key in ['course_id', 'faculty_id', 'indicator_id', 'assignment_version_id', 'semester_id']}
        self.payload.update(kind='assignment', title=' New report task ', due_on=self.semester['ends_on'])

    def post(self, **changes):
        return self.client.post('/api/demo/plans/', {**self.payload, **changes}, content_type='application/json')

    def edits(self):
        return SourceRevision.objects.filter(source_record__record_type='portal_edits').order_by('revision_number')

    def test_saved_task_reloads_with_statistics_and_unselected_choices(self):
        before = DATASET_PATH.read_bytes()
        snapshots = copy.deepcopy(list(SourceRevision.objects.values('pk', 'payload')))
        response = self.post()
        self.assertEqual(response.status_code, 201)
        task = response.json()
        self.assertNotEqual(task['id'], self.template['id'])
        self.assertEqual(task['task_title'], 'New report task')
        self.assertEqual(task['status'], 'to_start')
        self.assertEqual(task['evidence_ids'], [])
        self.assertEqual(task['faculty_explanation'], '')
        self.assertIsNone(task['schedule_id'])
        for key in ['course_id', 'faculty_id', 'indicator_id', 'assignment_version_id', 'student_group_id', 'criterion_id']:
            self.assertEqual(task[key], self.template[key])
        data = self.client.get('/api/demo/portal/').json()
        self.assertIn(task, data['assessments'])
        self.assertEqual(data['statistics'][task['id']], data['statistics'][self.template['id']])
        choices = [row for row in data['evidence'] if row['assessment_id'] == task['id']]
        self.assertTrue(choices)
        self.assertTrue(all(not row['selected'] for row in choices))
        originals = {row['id'] for row in data['evidence'] if row['assessment_id'] == self.template['id']}
        self.assertTrue(originals.isdisjoint(row['id'] for row in choices))
        self.assertEqual(next(row for row in data['assessments'] if row['id'] == self.template['id']), self.template)
        event = next(row for row in data['activity'] if row.get('entity_id') == task['id'])
        self.assertEqual(event['title'], 'Work assigned')
        self.assertIn('faculty', event['roles'])
        for row in snapshots:
            self.assertEqual(SourceRevision.objects.get(pk=row['pk']).payload, row['payload'])
        self.assertEqual(DATASET_PATH.read_bytes(), before)

    def test_other_faculty_can_be_assigned_without_forging_their_activity_feed(self):
        faculty = next(row for row in self.data['users'] if row['id'] != 'faculty-1' and 'faculty' in row['roles'])
        response = self.post(faculty_id=faculty['id'])
        self.assertEqual(response.status_code, 201)
        task = response.json()
        event = next(row for row in PortalDataFacade().load()['activity'] if row.get('entity_id') == task['id'])
        self.assertNotIn('faculty', event['roles'])
        self.assertEqual(task['faculty_id'], faculty['id'])

    def test_assignments_schedules_and_reviews_preserve_each_other(self):
        first = self.post().json()
        first_snapshot = copy.deepcopy(self.edits().first().payload)
        schedule = self.client.post('/api/demo/plans/', {'kind': 'schedule', 'title': 'Keep schedule', 'semester_id': self.semester['id'], 'program_id': self.data['programs'][0]['id'], 'due_on': self.semester['starts_on']}, content_type='application/json').json()
        review = next(row for row in self.data['peer_reviews'] if row['reviewer_id'] == 'faculty-1')
        self.assertEqual(self.client.post('/api/demo/reviews/', {'review_id': review['id'], 'feedback': 'Keep review', 'status': 'completed'}, content_type='application/json').status_code, 200)
        second = self.post(title='Another report task').json()
        self.assertNotEqual(first['id'], second['id'])
        data = PortalDataFacade().load()
        self.assertIn(first, data['assessments'])
        self.assertIn(second, data['assessments'])
        self.assertIn(schedule, data['schedules'])
        self.assertEqual(next(row for row in data['peer_reviews'] if row['id'] == review['id'])['feedback'], 'Keep review')
        self.assertEqual(self.edits().first().payload, first_snapshot)
        self.assertEqual(self.edits().count(), 4)

    def test_invalid_records_and_dates_leave_no_saves(self):
        other_course = next(row for row in self.data['courses'] if row['id'] != self.template['course_id'])
        not_faculty = next(row for row in self.data['users'] if 'faculty' not in row['roles'])
        before = (date.fromisoformat(self.semester['starts_on']) - timedelta(days=1)).isoformat()
        cases = [{'course_id': 'missing'}, {'course_id': other_course['id']}, {'faculty_id': 'missing'}, {'faculty_id': not_faculty['id']}, {'assignment_version_id': 'missing'}, {'indicator_id': 'missing'}, {'semester_id': 'missing'}, {'title': '  '}, {'title': 'x' * 256}, {'due_on': before}, {'due_on': 'bad'}]
        for changes in cases:
            with self.subTest(fields=list(changes)):
                self.assertEqual(self.post(**changes).status_code, 400)
        self.assertFalse(self.edits().exists())

    def test_unmapped_pi_is_rejected(self):
        data = copy.deepcopy(self.data)
        data['indicators'].append({**data['indicators'][0], 'id': 'unmapped-pi'})
        with patch('integrations.portal_data.PortalDataFacade.load', return_value=data):
            self.assertEqual(self.post(indicator_id='unmapped-pi').status_code, 400)
        self.assertFalse(self.edits().exists())

    def test_selected_pi_uses_its_matching_template(self):
        data = copy.deepcopy(self.data)
        data['indicators'].append({**data['indicators'][0], 'id': 'second-mapped-pi'})
        data['assessments'].append({**self.template, 'id': 'second-mapping', 'indicator_id': 'second-mapped-pi'})
        with patch('integrations.portal_data.PortalDataFacade.load', return_value=data):
            response = self.post(indicator_id='second-mapped-pi')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['indicator_id'], 'second-mapped-pi')

    def test_missing_selected_rubric_criterion_or_group_is_rejected(self):
        for change in ['criterion', 'group', 'assignment']:
            data = copy.deepcopy(self.data)
            version = next(row for row in data['assignment_versions'] if row['id'] == self.template['assignment_version_id'])
            if change == 'criterion':
                version['payload']['rubric'] = []
            elif change == 'group':
                data['student_groups'] = [row for row in data['student_groups'] if row['id'] != self.template['student_group_id']]
            else:
                version['assignment_id'] = -1
            with self.subTest(change=change), patch('integrations.portal_data.PortalDataFacade.load', return_value=data):
                self.assertEqual(self.post().status_code, 400)
        self.assertFalse(self.edits().exists())

    @override_settings(PORTAL_DATA_PROVIDER='mock')
    def test_file_provider_is_not_writable(self):
        self.assertEqual(self.post().status_code, 503)
        self.assertFalse(self.edits().exists())

    @override_settings(DEBUG=False)
    def test_disabled_outside_development(self):
        self.assertEqual(self.post().status_code, 404)
        self.assertFalse(self.edits().exists())
