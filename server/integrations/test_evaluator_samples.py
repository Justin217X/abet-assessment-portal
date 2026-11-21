# File: test_evaluator_samples.py
# Purpose: Tests released historical PDFs for the fixed demo Evaluator.
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from django.test import SimpleTestCase, override_settings

from .portal_data import MockPortalProvider
from .sample_reports import sample_report_catalog


@override_settings(DEBUG=True)
class EvaluatorSampleTests(SimpleTestCase):
    def setUp(self):
        self.folder = TemporaryDirectory()
        self.addCleanup(self.folder.cleanup)
        setting = override_settings(PORTAL_SAMPLE_PDF_DIR=self.folder.name)
        setting.enable()
        self.addCleanup(setting.disable)
        self.rows = sample_report_catalog()
        self.data = MockPortalProvider().load()
        self.data['sample_reports'] = self.rows
        self.data['access_grants'] = [
            {'user_id': 'evaluator-1', 'expires_on': '2099-01-01', 'sample_report_ids': [self.rows[0]['id']]},
            {'user_id': 'evaluator-1', 'expires_on': '2000-01-01', 'sample_report_ids': [self.rows[1]['id']]},
            {'user_id': 'other-user', 'expires_on': '2099-01-01', 'sample_report_ids': [self.rows[2]['id']]},
        ]

    def test_catalog_only_lists_unexpired_releases_for_demo_evaluator(self):
        with patch('integrations.portal_data.PortalDataFacade.load', return_value=self.data):
            response = self.client.get('/api/demo/evaluator/sample-reports/')
        self.assertEqual(response.status_code, 200)
        rows = response.json()['sample_reports']
        self.assertEqual([row['id'] for row in rows], [self.rows[0]['id']])
        self.assertEqual(len(response.json()['campuses']), len(self.data['campuses']))
        self.assertIn('/evaluator/', rows[0]['preview_url'])

    def test_expired_and_unreleased_files_are_rejected(self):
        with patch('integrations.portal_data.PortalDataFacade.load', return_value=self.data):
            for row in self.rows[1:3]:
                self.assertEqual(self.client.get('/api/demo/evaluator/sample-reports/' + row['id'] + '/').status_code, 404)

    def test_released_original_is_served_without_changing_bytes(self):
        content = b'%PDF-1.4\nLocal original bytes\n%%EOF'
        (Path(self.folder.name) / self.rows[0]['filename']).write_bytes(content)
        with patch('integrations.portal_data.PortalDataFacade.load', return_value=self.data):
            response = self.client.get('/api/demo/evaluator/sample-reports/' + self.rows[0]['id'] + '/')
        try:
            self.assertEqual(response.status_code, 200)
            self.assertEqual(b''.join(response.streaming_content), content)
        finally:
            response.close()

    @override_settings(DEBUG=False)
    def test_production_routes_are_disabled(self):
        with patch('integrations.portal_data.PortalDataFacade.load') as loader:
            self.assertEqual(self.client.get('/api/demo/evaluator/sample-reports/').status_code, 404)
            self.assertEqual(self.client.get('/api/demo/evaluator/sample-reports/' + self.rows[0]['id'] + '/').status_code, 404)
            loader.assert_not_called()
