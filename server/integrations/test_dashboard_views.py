# File: test_dashboard_views.py
# Purpose: Checks dashboard demo responses and development-only restrictions.

from unittest.mock import patch

from django.test import TestCase, override_settings
from django.urls import reverse


@override_settings(DEBUG=True, PORTAL_DATA_PROVIDER='mock', CANVAS_DATA_CONNECTOR='mock', ROSTER_DATA_CONNECTOR='mock')
class DashboardApiTests(TestCase):
    def test_returns_shared_records_statistics_and_csrf_cookie(self):
        response = self.client.get(reverse('demo-portal-data'))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['metadata']['fictional'])
        self.assertEqual(len(data['campuses']), 6)
        self.assertEqual(len(data['assessments']), 30)
        self.assertEqual(data['statistics']['assessment-1']['total_students'], 20)
        self.assertIn('current_date', data['metadata'])
        self.assertIn('csrftoken', response.cookies)
        self.assertEqual(response['Cache-Control'], 'private, no-store')

    @override_settings(DEBUG=False)
    def test_production_rejects_request_without_loading_records(self):
        with patch('integrations.dashboard_views.load_dashboard_data') as loader:
            self.assertEqual(self.client.get(reverse('demo-portal-data')).status_code, 404)
        loader.assert_not_called()

    @override_settings(PORTAL_DATA_PROVIDER='live')
    def test_unimplemented_provider_returns_clear_service_error(self):
        response = self.client.get(reverse('demo-portal-data'))
        self.assertEqual(response.status_code, 503)
        self.assertIn('not implemented', response.json()['error'])

    @override_settings(PORTAL_DATA_PROVIDER='saved_mock')
    def test_missing_snapshot_does_not_fall_back_to_json(self):
        response = self.client.get(reverse('demo-portal-data'))
        self.assertEqual(response.status_code, 503)
        self.assertIn('No saved mock dataset', response.json()['error'])

    def test_post_is_rejected(self):
        self.assertEqual(self.client.post(reverse('demo-portal-data')).status_code, 405)
