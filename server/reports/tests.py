# File: tests.py
# Purpose: Checks the basic Rubric Report PDF contents.

import json
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

from django.test import SimpleTestCase
from reportlab.platypus import SimpleDocTemplate

from integrations.rubric_preview import build_rubric_preview
from .rubric_pdf import generate_rubric_pdf


class RubricPdfTests(SimpleTestCase):
    def preview(self):
        path = Path(__file__).resolve().parent.parent / 'demo_data' / 'canvas_assignment_with_rubric.json'
        with path.open(encoding='utf-8') as fixture:
            payload = json.load(fixture)
        return build_rubric_preview(SimpleNamespace(
            title=payload['name'], source_revision=SimpleNamespace(payload=payload),
        ))

    def readable_pdf(self, preview):
        # Disable compression only in tests so the PDF text stream can be checked.
        with patch(
            'reports.rubric_pdf.SimpleDocTemplate',
            side_effect=lambda *args, **kwargs: SimpleDocTemplate(*args, pageCompression=0, **kwargs),
        ):
            return generate_rubric_pdf(preview)

    def test_pdf_contains_title_criterion_maximum_and_all_rating_fields(self):
        preview = self.preview()
        pdf = self.readable_pdf(preview)
        self.assertTrue(pdf.startswith(b'%PDF-'))
        self.assertIn(preview['assignment_title'].encode(), pdf)
        criterion = preview['criteria'][0]
        self.assertIn(criterion['label'].encode(), pdf)
        # ReportLab can wrap text into multiple PDF drawing operations.
        self.assertIn(b'Evaluate code organization', pdf)
        self.assertIn(b'Maximum: 20 points', pdf)
        for rating in criterion['ratings']:
            self.assertIn(rating['label'].encode(), pdf)
            self.assertIn(str(rating['points']).encode(), pdf)
            self.assertIn(rating['description'].split()[0].encode(), pdf)

    def test_no_rubric_has_clear_empty_message(self):
        preview = self.preview()
        preview['criteria'] = []
        self.assertIn(b'No rubric criteria were provided.', self.readable_pdf(preview))

    def test_literal_markup_and_long_descriptions_can_be_rendered(self):
        preview = self.preview()
        preview['assignment_title'] = '<example> & rubric'
        preview['criteria'][0]['description'] = 'Long criterion explanation. ' * 120
        preview['criteria'][0]['ratings'][0]['description'] = 'Detailed rating explanation. ' * 100
        self.assertTrue(generate_rubric_pdf(preview).startswith(b'%PDF-'))
