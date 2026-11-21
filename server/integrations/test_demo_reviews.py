# File: test_demo_reviews.py
# Purpose: Tests local demo review saving, validation, and reloads.
import copy
import json
from io import StringIO
from unittest.mock import patch

from django.core.management import call_command
from django.test import Client, TestCase, override_settings

from .models import ImportRun, SourceRecord, SourceRevision
from .portal_data import DATASET_PATH, MockPortalProvider, PortalDataFacade


@override_settings(DEBUG=True, PORTAL_DATA_PROVIDER='saved_mock')
class DemoReviewTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command('seed_portal_demo', stdout=StringIO())

    def setUp(self):
        data = MockPortalProvider().load()
        self.review = next(row for row in data['peer_reviews'] if row['reviewer_id'] == 'faculty-1' and row['status'] == 'assigned')

    def post(self, **changes):
        payload = {'review_id': self.review['id'], 'feedback': ' Clear rubric feedback. ', 'status': 'assigned'}
        return self.client.post('/api/demo/reviews/', {**payload, **changes}, content_type='application/json')

    def edits(self):
        return SourceRevision.objects.filter(source_record__record_type='portal_edits').order_by('revision_number')

    def test_feedback_and_completion_reload_without_changing_inputs(self):
        before = DATASET_PATH.read_bytes()
        originals = copy.deepcopy(list(SourceRevision.objects.values('pk', 'payload')))
        self.assertEqual(self.post().status_code, 200)
        first = copy.deepcopy(self.edits().first().payload)
        response = self.post(feedback='Complete feedback', status='completed')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Cache-Control'], 'no-store')
        data = self.client.get('/api/demo/portal/').json()
        saved = next(row for row in data['peer_reviews'] if row['id'] == self.review['id'])
        self.assertEqual(saved['feedback'], 'Complete feedback')
        self.assertEqual(saved['status'], 'completed')
        self.assertTrue(any(row['entity_id'] == self.review['id'] and row['title'] == 'Peer review completed' for row in data['activity']))
        self.assertEqual(list(self.edits().values_list('revision_number', flat=True)), [1, 2])
        self.assertEqual(self.edits().first().payload, first)
        for row in originals:
            self.assertEqual(SourceRevision.objects.get(pk=row['pk']).payload, row['payload'])
        self.assertEqual(DATASET_PATH.read_bytes(), before)

    def test_previous_feedback_and_other_reviews_are_preserved(self):
        self.post(feedback='First feedback', status='completed')
        other = next(row for row in MockPortalProvider().load()['peer_reviews'] if row['reviewer_id'] == 'faculty-1' and row['id'] != self.review['id'])
        self.post(review_id=other['id'], feedback='Other review feedback')
        data = PortalDataFacade().load()
        saved = next(row for row in data['peer_reviews'] if row['id'] == self.review['id'])
        self.assertEqual(saved['feedback'], 'First feedback')
        self.assertEqual(saved['status'], 'completed')
        # Omitting status keeps the last saved state.
        response = self.client.post('/api/demo/reviews/', {'review_id': self.review['id'], 'feedback': 'Updated'}, content_type='application/json')
        self.assertEqual(response.json()['status'], 'completed')

    def test_invalid_fields_and_unassigned_reviews_leave_no_saves(self):
        other = next(row for row in MockPortalProvider().load()['peer_reviews'] if row['reviewer_id'] != 'faculty-1')
        for changes in [{'review_id': 'missing'}, {'review_id': other['id']}, {'feedback': None}, {'feedback': 'x' * 10001}, {'status': 'invalid'}, {'status': 'completed', 'feedback': '   '}]:
            with self.subTest(changes=list(changes)):
                self.assertEqual(self.post(**changes).status_code, 400)
        self.assertFalse(self.edits().exists())
        self.assertFalse(ImportRun.objects.filter(import_kind='portal_demo_review').exists())

    def test_bad_json_and_non_objects_return_400(self):
        for body in ['{', '[]', 'null', '3', '"text"', b'\xff']:
            self.assertEqual(self.client.post('/api/demo/reviews/', body, content_type='application/json').status_code, 400)

    def test_get_and_missing_csrf_are_rejected(self):
        self.assertEqual(self.client.get('/api/demo/reviews/').status_code, 405)
        client = Client(enforce_csrf_checks=True)
        self.assertEqual(client.post('/api/demo/reviews/', {}, content_type='application/json').status_code, 403)
        client.get('/api/demo/portal/')
        response = client.post('/api/demo/reviews/', {'review_id': self.review['id'], 'feedback': 'CSRF checked'}, content_type='application/json', HTTP_X_CSRFTOKEN=client.cookies['csrftoken'].value)
        self.assertEqual(response.status_code, 200)

    @override_settings(DEBUG=False)
    def test_disabled_outside_development(self):
        with patch('integrations.review_views.save_demo_review') as saver:
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
