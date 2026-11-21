# File: test_saved_rubric_pdf.py
# Purpose: Checks that downloads use the same saved version as the preview.

from copy import deepcopy
from io import StringIO
from unittest.mock import patch
import uuid

from django.core.management import call_command
from django.test import TestCase, override_settings
from django.urls import reverse

from reports.rubric_pdf import generate_rubric_pdf
from .assignment_import import store_canvas_assignment
from .models import AssignmentVersion


@override_settings(DEBUG=True)
class SavedRubricPdfTests(TestCase):
    def setUp(self):
        call_command('import_mock_canvas_assignment', stdout=StringIO())
        self.first = AssignmentVersion.objects.select_related(
            'assignment__canvas_course', 'source_revision__import_run',
        ).get()

    def url(self, version_id):
        return reverse('saved-assignment-rubric-pdf', kwargs={'version_id': version_id})

    def test_each_download_uses_the_same_data_as_its_saved_preview(self):
        payload = deepcopy(self.first.source_revision.payload)
        payload['name'] = 'Revised rubric assignment'
        payload['rubric'][0]['points'] = 25
        payload['rubric'][0]['ratings'][0]['points'] = 25
        second = store_canvas_assignment(
            payload, canvas_course=self.first.assignment.canvas_course,
            import_run=self.first.source_revision.import_run,
        )
        for version in [self.first, second]:
            with self.subTest(version=version.pk), patch(
                'reports.rubric_pdf.generate_rubric_pdf', wraps=generate_rubric_pdf,
            ) as renderer:
                response = self.client.get(self.url(version.pk))
                preview_url = reverse('saved-assignment-rubric', kwargs={'version_id': version.pk})
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response['Content-Type'], 'application/pdf')
                self.assertIn(str(version.pk), response['Content-Disposition'])
                self.assertTrue(response['Content-Disposition'].startswith('attachment;'))
                self.assertEqual(response['Cache-Control'], 'private, no-store')
                self.assertTrue(response.content.startswith(b'%PDF-'))
                self.assertEqual(renderer.call_args.args[0], self.client.get(preview_url).json())

    def test_unknown_version_returns_404(self):
        self.assertEqual(self.client.get(self.url(uuid.uuid4())).status_code, 404)

    def test_post_is_rejected(self):
        self.assertEqual(self.client.post(self.url(self.first.pk)).status_code, 405)

    @override_settings(DEBUG=False)
    def test_download_is_disabled_outside_development(self):
        self.assertEqual(self.client.get(self.url(self.first.pk)).status_code, 404)
