"""
File: tests.py
Purpose: Tests assessment report calculations, PDF generation, and API endpoints.
"""

from copy import deepcopy

from django.test import SimpleTestCase, override_settings

from .demo_data import load_demo_pi_report, load_demo_rubric_report, load_fixture
from .pi_calculations import calculate_pi_statistics
from .pi_pdf import generate_pi_pdf
from .rubric_pdf import generate_rubric_pdf


class ReportDataTests(SimpleTestCase):
    """Tests the data used for report generation."""

    def test_rubric_data(self):
        """RPT-01: Load Rubric Report data."""
        data = load_demo_rubric_report()

        self.assertEqual(
            data['assignment_title'],
            'Demo Programming Assignment',
        )
        self.assertEqual(data['course']['id'], 101)
        self.assertEqual(data['total_points'], 20)
        self.assertEqual(len(data['criteria']), 1)
        self.assertEqual(len(data['criteria'][0]['ratings']), 4)

    def test_pi_data(self):
        """RPT-02: Load PI Report data."""
        data = load_demo_pi_report()

        self.assertEqual(
            data['performance_indicator']['code'],
            '6.a',
        )
        self.assertEqual(data['statistics']['total_students'], 30)
        self.assertTrue(data['instructor_comments'])


class PICalculationTests(SimpleTestCase):
    """Tests the accuracy of PI statistical calculations."""

    def setUp(self):
        # Load fresh test data before each test. [JH]
        assignment = load_fixture(
            'canvas_assignment_with_rubric.json'
        )

        self.criterion = assignment['rubric'][0]
        self.submissions = load_fixture(
            'canvas_assignment_submissions.json'
        )

        self.statistics = calculate_pi_statistics(
            self.criterion,
            self.submissions,
        )

    def test_student_count(self):
        """RPT-03: Calculate the total number of assessed students."""
        self.assertEqual(self.statistics['total_students'], 30)

    def test_performance_distribution(self):
        """RPT-04: Calculate student counts by performance level."""
        counts = [
            level['student_count']
            for level in self.statistics['distribution']
        ]

        self.assertEqual(counts, [2, 4, 9, 15])

    def test_percentages(self):
        """RPT-05: Calculate performance level percentages."""
        percentages = [
            level['percentage']
            for level in self.statistics['distribution']
        ]

        expected = [6.67, 13.33, 30.00, 50.00]

        # Compare rounded values to avoid floating-point differences. [JH]
        for actual, target in zip(percentages, expected):
            self.assertAlmostEqual(actual, target, places=2)

        self.assertAlmostEqual(sum(percentages), 100.0, places=2)

    def test_score_statistics(self):
        """RPT-06: Calculate minimum, maximum, median, and mean."""
        self.assertEqual(self.statistics['min_score'], 5)
        self.assertEqual(self.statistics['max_score'], 20)
        self.assertEqual(self.statistics['median_score'], 17.5)

        self.assertAlmostEqual(
            self.statistics['mean_score'],
            16.17,
            places=2,
        )

    def test_performance_levels(self):
        """RPT-07: Calculate mean and highest supported levels."""
        self.assertEqual(
            self.statistics['highest_supported_level'],
            4,
        )
        self.assertAlmostEqual(
            self.statistics['mean_level'],
            3.23,
            places=2,
        )

    def test_empty_submissions(self):
        """RPT-08: Handle an assignment with no submissions."""
        result = calculate_pi_statistics(self.criterion, [])

        self.assertEqual(result['total_students'], 0)
        self.assertIsNone(result['min_score'])
        self.assertIsNone(result['max_score'])
        self.assertIsNone(result['median_score'])
        self.assertIsNone(result['mean_score'])
        self.assertIsNone(result['mean_level'])

        for level in result['distribution']:
            self.assertEqual(level['student_count'], 0)
            self.assertEqual(level['percentage'], 0)
            self.assertIsNone(level['average_score'])

    def test_ungraded_submission(self):
        """RPT-09: Exclude ungraded submissions."""
        submission = deepcopy(self.submissions[0])
        submission['workflow_state'] = 'submitted'

        result = calculate_pi_statistics(
            self.criterion,
            [submission],
        )

        self.assertEqual(result['total_students'], 0)

    def test_missing_submission(self):
        """RPT-10: Exclude missing submissions."""
        submission = deepcopy(self.submissions[0])
        submission['missing'] = True

        result = calculate_pi_statistics(
            self.criterion,
            [submission],
        )

        self.assertEqual(result['total_students'], 0)

    def test_excused_submission(self):
        """RPT-11: Exclude excused submissions."""
        submission = deepcopy(self.submissions[0])
        submission['excused'] = True

        result = calculate_pi_statistics(
            self.criterion,
            [submission],
        )

        self.assertEqual(result['total_students'], 0)

    def test_missing_rubric_assessment(self):
        """RPT-12: Exclude submissions without rubric assessments."""
        submission = deepcopy(self.submissions[0])
        submission['rubric_assessment'] = {}

        result = calculate_pi_statistics(
            self.criterion,
            [submission],
        )

        self.assertEqual(result['total_students'], 0)


class PDFGenerationTests(SimpleTestCase):
    """Tests the generation of assessment report PDFs."""

    def test_generate_rubric_pdf(self):
        """RPT-13: Generate a Rubric Report PDF."""
        data = load_demo_rubric_report()
        pdf = generate_rubric_pdf(data)

        # PDF files begin with the %PDF- file signature. [JH]
        self.assertIsInstance(pdf, bytes)
        self.assertTrue(pdf.startswith(b'%PDF-'))
        self.assertTrue(pdf.rstrip().endswith(b'%%EOF'))

    def test_generate_pi_pdf(self):
        """RPT-14: Generate a PI Report PDF."""
        data = load_demo_pi_report()
        pdf = generate_pi_pdf(data)

        self.assertIsInstance(pdf, bytes)
        self.assertTrue(pdf.startswith(b'%PDF-'))
        self.assertTrue(pdf.rstrip().endswith(b'%%EOF'))


# Enable development mode for the demo endpoint tests. [JH]
@override_settings(DEBUG=True)
class ReportAPITests(SimpleTestCase):
    """Tests report preview and download endpoints."""

    def test_rubric_report_endpoint(self):
        """RPT-15: Download a Rubric Report through the API."""
        response = self.client.get('/api/demo/rubric-report/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response['Content-Type'],
            'application/pdf',
        )
        self.assertEqual(
            response['Content-Disposition'],
            'attachment; filename="rubric_report.pdf"',
        )
        self.assertTrue(response.content.startswith(b'%PDF-'))

    def test_pi_report_endpoint(self):
        """RPT-16: Download a PI Report through the API."""
        response = self.client.get('/api/demo/pi-report/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response['Content-Type'],
            'application/pdf',
        )
        self.assertEqual(
            response['Content-Disposition'],
            'attachment; filename="pi_report.pdf"',
        )
        self.assertTrue(response.content.startswith(b'%PDF-'))

    def test_pi_preview_endpoint(self):
        """RPT-17: Retrieve PI Report preview data."""
        response = self.client.get('/api/demo/pi-preview/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response['Content-Type'],
            'application/json',
        )

        data = response.json()

        self.assertEqual(data['statistics']['total_students'], 30)
        self.assertEqual(
            data['performance_indicator']['code'],
            '6.a',
        )

    @override_settings(DEBUG=False)
    def test_demo_endpoints_disabled(self):
        """RPT-18: Disable demo endpoints outside development mode."""
        endpoints = [
            '/api/demo/rubric-report/',
            '/api/demo/pi-report/',
            '/api/demo/pi-preview/',
        ]

        for endpoint in endpoints:
            with self.subTest(endpoint=endpoint):
                response = self.client.get(endpoint)
                self.assertEqual(response.status_code, 404)

    def test_unsupported_http_method(self):
        """RPT-19: Reject POST requests to GET-only endpoints."""
        endpoints = [
            '/api/demo/rubric-report/',
            '/api/demo/pi-report/',
            '/api/demo/pi-preview/',
        ]

        for endpoint in endpoints:
            with self.subTest(endpoint=endpoint):
                response = self.client.post(endpoint)
                self.assertEqual(response.status_code, 405)
