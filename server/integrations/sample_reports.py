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


def evaluator_sample_report_catalog():

    # Show only examples released to the fixed demo evaluator.
    # !!! This is a demo access check, not real user authentication.
    from django.utils import timezone
    from .portal_data import PortalDataFacade
    data = PortalDataFacade().load()
    today = timezone.localdate().isoformat()

    # Keep PDF IDs from this evaluator's releases that have not expired.
    allowed = {sample_id for grant in data['access_grants']
               if grant['user_id'] == 'evaluator-1' and grant['expires_on'] >= today
               for sample_id in grant.get('sample_report_ids', [])}

    # Return released examples with links to the evaluator PDF routes.
    return [{**row, 'preview_url': f'/api/demo/evaluator/sample-reports/{row["id"]}/',
             'download_url': f'/api/demo/evaluator/sample-reports/{row["id"]}/?download=1'}
            for row in sample_report_catalog() if row['id'] in allowed]
