# File: test_demo_schedules.py
# Purpose: Tests demo schedule validation, saving, and reloads.
import copy
from datetime import date, timedelta
from io import StringIO
from unittest.mock import patch

from django.core.management import call_command
from django.test import Client, TestCase, override_settings

from .models import ImportRun, SourceRecord, SourceRevision
from .portal_data import DATASET_PATH, MockPortalProvider, PortalDataFacade


@override_settings(DEBUG=True, PORTAL_DATA_PROVIDER='saved_mock')
class DemoScheduleTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command('seed_portal_demo', stdout=StringIO())

    def setUp(self):
        self.original = MockPortalProvider().load()
        self.semester = self.original['semesters'][0]
        self.payload = {'kind': 'schedule', 'title': ' Schedule test ',
                        'semester_id': self.semester['id'], 'program_id': self.original['programs'][0]['id'],
                        'due_on': self.semester['starts_on']}

    def post(self, **changes):
        return self.client.post('/api/demo/plans/', {**self.payload, **changes}, content_type='application/json')

    def edits(self):
        return SourceRevision.objects.filter(source_record__record_type='portal_edits').order_by('revision_number')

    def test_save_reload_activity_and_original_records(self):
        before = DATASET_PATH.read_bytes()
        versions = copy.deepcopy(list(SourceRevision.objects.values('pk', 'payload')))
        response = self.post()
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response['Cache-Control'], 'no-store')
        saved = response.json()
        self.assertEqual(saved['title'], 'Schedule test')
        self.assertEqual(saved['owner_id'], 'coordinator-1')
        self.assertEqual(saved['due_on'], self.semester['starts_on'])
        data = self.client.get('/api/demo/portal/').json()
        self.assertIn(saved, data['schedules'])
        self.assertEqual(len(data['schedules']), len(self.original['schedules']) + 1)
        self.assertEqual(data['assessments'], self.original['assessments'])
        event = next(row for row in data['activity'] if row.get('entity_id') == saved['id'])
        self.assertEqual(event['title'], 'Schedule saved')
        self.assertEqual(event['roles'], ['coordinator', 'admin'])
        for row in versions:
            self.assertEqual(SourceRevision.objects.get(pk=row['pk']).payload, row['payload'])
        self.assertEqual(DATASET_PATH.read_bytes(), before)

    def test_schedule_and_review_saves_preserve_each_other(self):
        first = self.post().json()
        snapshot = copy.deepcopy(self.edits().first().payload)
        review = next(row for row in self.original['peer_reviews'] if row['reviewer_id'] == 'faculty-1')
        response = self.client.post('/api/demo/reviews/', {'review_id': review['id'], 'feedback': 'Keep feedback', 'status': 'completed'}, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        second = self.post(title='Second schedule').json()
        self.assertNotEqual(first['id'], second['id'])
        data = PortalDataFacade().load()
        self.assertIn(first, data['schedules'])
        self.assertIn(second, data['schedules'])
        self.assertEqual(next(row for row in data['peer_reviews'] if row['id'] == review['id'])['feedback'], 'Keep feedback')
        self.assertEqual(self.edits().first().payload, snapshot)
        self.assertEqual(list(self.edits().values_list('revision_number', flat=True)), [1, 2, 3])

    def test_semester_end_date_is_allowed(self):
        self.assertEqual(self.post(due_on=self.semester['ends_on']).status_code, 201)

    def test_invalid_fields_leave_no_saves(self):
        before = (date.fromisoformat(self.semester['starts_on']) - timedelta(days=1)).isoformat()
        after = (date.fromisoformat(self.semester['ends_on']) + timedelta(days=1)).isoformat()
        for changes in [{'kind': 'assignment'}, {'kind': 'other'}, {'title': ''}, {'title': '  '}, {'title': None}, {'title': 'x' * 256}, {'semester_id': 'missing'}, {'program_id': 'missing'}, {'due_on': 'bad'}, {'due_on': None}, {'due_on': before}, {'due_on': after}]:
            with self.subTest(fields=list(changes)):
                self.assertEqual(self.post(**changes).status_code, 400)
        self.assertFalse(self.edits().exists())
        self.assertFalse(ImportRun.objects.filter(import_kind='portal_demo_edit').exists())

    def test_bad_json_non_objects_get_and_csrf(self):
        for body in ['{', '[]', 'null', '"text"', b'\xff']:
            self.assertEqual(self.client.post('/api/demo/plans/', body, content_type='application/json').status_code, 400)
        self.assertEqual(self.client.get('/api/demo/plans/').status_code, 405)
        client = Client(enforce_csrf_checks=True)
        self.assertEqual(client.post('/api/demo/plans/', self.payload, content_type='application/json').status_code, 403)
        client.get('/api/demo/portal/')
        response = client.post('/api/demo/plans/', self.payload, content_type='application/json', HTTP_X_CSRFTOKEN=client.cookies['csrftoken'].value)
        self.assertEqual(response.status_code, 201)

    @override_settings(DEBUG=False)
    def test_disabled_outside_development(self):
        with patch('integrations.schedule_views.save_demo_plan') as saver:
            self.assertEqual(self.post().status_code, 404)
            saver.assert_not_called()

    @override_settings(PORTAL_DATA_PROVIDER='mock')
    def test_file_provider_cannot_accept_saves_it_would_not_reload(self):
        self.assertEqual(self.post().status_code, 503)
        self.assertFalse(self.edits().exists())

    def test_missing_seed_returns_503(self):
        SourceRevision.objects.filter(source_record__record_type='dataset').delete()
        self.assertEqual(self.post().status_code, 503)
        self.assertFalse(SourceRecord.objects.filter(record_type='portal_edits').exists())

    def test_real_records_are_rejected(self):
        with patch('integrations.portal_data.PortalDataFacade.load', return_value={'metadata': {'fictional': False}}):
            self.assertEqual(self.post().status_code, 503)
        self.assertFalse(self.edits().exists())
