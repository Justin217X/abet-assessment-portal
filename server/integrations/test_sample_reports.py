# File: test_sample_reports.py
# Purpose: Tests local historical PDF links, original bytes, and file-path checks.
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from django.test import SimpleTestCase, override_settings

from .sample_reports import sample_report_catalog, sample_report_path


@override_settings(DEBUG=True)
class SampleReportTests(SimpleTestCase):
    def setUp(self):
        self.folder = TemporaryDirectory()
        self.addCleanup(self.folder.cleanup)
        self.root = Path(self.folder.name)
        setting = override_settings(PORTAL_SAMPLE_PDF_DIR=self.root)
        setting.enable()
        self.addCleanup(setting.disable)
        self.row = sample_report_catalog()[0]
        self.url = self.row['preview_url']
        self.original = b'%PDF-1.4\nOriginal local test bytes\n%%EOF'

    def put_sample(self):
        (self.root / self.row['filename']).write_bytes(self.original)

    def test_catalog_lists_manifest_ids_with_actual_file_availability(self):
        self.put_sample()
        response = self.client.get('/api/demo/sample-reports/')
        self.assertEqual(response.status_code, 200)
        rows = response.json()['sample_reports']
        self.assertEqual(len(rows), 14)
        self.assertTrue(rows[0]['file_available'])
        self.assertTrue(all(not row['file_available'] for row in rows[1:]))
        self.assertEqual(rows[0]['download_url'], self.url + '?download=1')
        self.assertFalse(rows[0]['generated_by_ai'])
        self.assertEqual(response['Cache-Control'], 'private, no-store')

    def test_preview_and_download_serve_exact_original_bytes(self):
        self.put_sample()
        for suffix, disposition in [('', 'inline'), ('?download=1', 'attachment')]:
            with self.subTest(disposition=disposition):
                response = self.client.get(self.url + suffix)
                try:
                    self.assertEqual(response.status_code, 200)
                    self.assertEqual(b''.join(response.streaming_content), self.original)
                    self.assertEqual(response['Content-Type'], 'application/pdf')
                    self.assertTrue(response['Content-Disposition'].startswith(disposition + ';'))
                    self.assertIn(self.row['filename'], response['Content-Disposition'])
                    self.assertEqual(response['X-Frame-Options'], 'SAMEORIGIN')
                    self.assertEqual(response['X-Content-Type-Options'], 'nosniff')
                    self.assertEqual(response['Cache-Control'], 'private, no-store')
                finally:
                    response.close()

    def test_unknown_and_missing_files_return_404(self):
        self.assertEqual(self.client.get(self.url).status_code, 404)
        self.assertEqual(self.client.get('/api/demo/sample-reports/not-listed/').status_code, 404)
        # An unlisted local PDF does not become accessible by its filename.
        (self.root / 'private.pdf').write_bytes(self.original)
        self.assertEqual(self.client.get('/api/demo/sample-reports/private.pdf/').status_code, 404)

    def test_invalid_manifest_paths_and_non_pdf_files_are_rejected(self):
        for filename in ['../private.pdf', '..\\private.pdf', '/private.pdf', 'C:/private.pdf', 'folder/file.pdf', 'folder\\file.pdf', 'file.txt', '', None]:
            with self.subTest(filename=filename):
                self.assertIsNone(sample_report_path({'filename': filename}))
        (self.root / 'directory.pdf').mkdir()
        self.assertIsNone(sample_report_path({'filename': 'directory.pdf'}))

    def test_resolved_file_cannot_escape_the_sample_folder(self):
        # Model a link that resolves outside the folder without needing Windows link privileges.
        with TemporaryDirectory() as outside:
            target = Path(outside) / 'private.pdf'
            target.write_bytes(self.original)
            original_resolve = Path.resolve
            with patch('pathlib.Path.resolve', autospec=True, side_effect=lambda path: target if path == self.root / 'linked.pdf' else original_resolve(path)):
                self.assertIsNone(sample_report_path({'filename': 'linked.pdf'}))

    def test_file_removed_after_lookup_returns_404(self):
        from unittest.mock import Mock
        missing = Mock()
        missing.open.side_effect = FileNotFoundError
        with patch('integrations.sample_views.sample_report_catalog', return_value=[self.row]):
            with patch('integrations.sample_views.sample_report_path', return_value=missing):
                self.assertEqual(self.client.get(self.url).status_code, 404)

    @override_settings(DEBUG=False)
    def test_disabled_outside_development_before_reading_files(self):
        with patch('integrations.sample_views.sample_report_catalog') as catalog:
            self.assertEqual(self.client.get('/api/demo/sample-reports/').status_code, 404)
            self.assertEqual(self.client.get(self.url).status_code, 404)
            catalog.assert_not_called()

    def test_post_requests_are_rejected(self):
        self.assertEqual(self.client.post('/api/demo/sample-reports/').status_code, 405)
        self.assertEqual(self.client.post(self.url).status_code, 405)
