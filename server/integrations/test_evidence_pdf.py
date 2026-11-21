# File: test_evidence_pdf.py
# Purpose: Tests fictional student-work PDF previews.
#
# Uses mock records without contacting Canvas or LionPath.
# Checks the selected example, PDF response, and development-only access.
#
# !!! Keep these tests while the demo PDF feature exists. [SD]
# !!! Add separate tests for real student files when that connection is built. [SD]

from unittest.mock import patch

from django.test import TestCase, override_settings

from .evidence_pdf import generate_evidence_pdf
from .dashboard_data import load_dashboard_data


@override_settings(DEBUG=True, PORTAL_DATA_PROVIDER='mock')
class EvidencePdfTests(TestCase):

    # Check that selected and replacement examples use their own records.
    def test_selected_and_replacement_examples_use_their_own_source_data(self):
        data = load_dashboard_data()
        choices = [row for row in data['evidence'] if row['assessment_id'] == 'assessment-2' and row['band'] == 'high']
        selected = next(row for row in choices if row['selected'])
        replacement = next(row for row in choices if row['student_id'] != selected['student_id'] and row['eligible'])
        for example in [selected, replacement]:
            with self.subTest(evidence_id=example['id']), patch('integrations.evidence_views.generate_evidence_pdf', wraps=generate_evidence_pdf) as renderer:
                response = self.client.get(f'/api/demo/evidence/{example["id"]}/pdf/')
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response['Content-Type'], 'application/pdf')
                self.assertTrue(response.content.startswith(b'%PDF-'))
                self.assertEqual(response['Cache-Control'], 'no-store')
                self.assertIn('inline;', response['Content-Disposition'])
                self.assertIn(f'{example["id"]}-preview.pdf', response['Content-Disposition'])

                # Check which records were passed to the PDF generator.
                rendered_data, rendered_example = renderer.call_args.args
                self.assertEqual(rendered_example, example)
                assessment = next(row for row in rendered_data['assessments'] if row['id'] == example['assessment_id'])
                self.assertEqual(assessment['assignment_version_id'], 'version-91502-1')

    # Return Not Found when the requested example does not exist
    def test_unknown_example_is_not_a_pdf(self):
        self.assertEqual(self.client.get('/api/demo/evidence/not-found/pdf/').status_code, 404)

    # Block demo PDF access when development mode is off.
    @override_settings(DEBUG=False)
    def test_demo_pdf_is_disabled_outside_development(self):
        with patch('integrations.evidence_views.load_dashboard_data') as loader:
            self.assertEqual(self.client.get('/api/demo/evidence/evidence-1-high/pdf/').status_code, 404)
            loader.assert_not_called()

    # Report unavailable data instead of returning a different example.
    @override_settings(PORTAL_DATA_PROVIDER='unimplemented')
    def test_unavailable_provider_does_not_fall_back_to_an_unrelated_pdf(self):
        self.assertEqual(self.client.get('/api/demo/evidence/evidence-1-high/pdf/').status_code, 503)

    # Do not turn real records into fictional work previews.
    def test_real_dataset_is_never_rendered_as_mock_work(self):
        with patch('integrations.evidence_views.load_dashboard_data', return_value={'metadata': {'fictional': False}}):
            self.assertEqual(self.client.get('/api/demo/evidence/anything/pdf/').status_code, 404)

    # Check that special characters and long text do not stop PDF generation.
    def test_renderer_accepts_literal_markup_and_long_lines(self):
        data = load_dashboard_data()
        example = dict(data['evidence'][0], content='if score < 10 and name != "<b>Example</b>":\n' + 'x' * 500)
        self.assertTrue(generate_evidence_pdf(data, example).startswith(b'%PDF-'))

    # Accept preview requests only; this endpoint never saves changes.
    def test_post_is_rejected(self):
        self.assertEqual(self.client.post('/api/demo/evidence/evidence-1-high/pdf/').status_code, 405)
