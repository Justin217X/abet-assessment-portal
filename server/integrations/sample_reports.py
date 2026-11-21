# File: sample_reports.py
# Purpose: Lists supplied historical PDFs and finds their local files.
# !!! Historical originals are not AI-generated reports for mock assessments. [SD]
from pathlib import Path

from django.conf import settings

from .portal_data import MockPortalProvider


def sample_report_path(row):
    root = Path(settings.PORTAL_SAMPLE_PDF_DIR).resolve()
    filename = row['filename']
    # Accept a simple PDF filename only, including on other operating systems.
    if not isinstance(filename, str) or '/' in filename or '\\' in filename or Path(filename).name != filename or not filename.lower().endswith('.pdf'):
        return None
    path = (root / filename).resolve()
    return path if path.parent == root and path.is_file() else None


def sample_report_catalog():
    result = []
    # Filenames come from the checked-in manifest, never a request path.
    for row in MockPortalProvider().load().get('sample_reports', []):
        result.append({**row, 'file_available': sample_report_path(row) is not None,
                       'preview_url': f'/api/demo/sample-reports/{row["id"]}/',
                       'download_url': f'/api/demo/sample-reports/{row["id"]}/?download=1'})
    return result
