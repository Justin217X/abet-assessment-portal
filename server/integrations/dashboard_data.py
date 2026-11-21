# File: dashboard_data.py
# Purpose: Prepares shared assignment records and PI results for dashboard pages.
# !!! Mock records only. Sign-in, record permissions, and saved edits are separate work. [SD]

from copy import deepcopy

from reports.pi_calculations import calculate_pi_statistics
from .evidence_candidates import build_evidence_candidates
from .portal_data import PortalDataFacade
from .source_connectors import canvas_connector, roster_connector


def prepare_dashboard_data(records):
    # Work on a copy so preparing results cannot change the source snapshot.
    data = deepcopy(records)
    canvas = canvas_connector(data)
    roster = roster_connector(data)
    courses = {row['id']: row for row in data['courses']}
    data['assignments'] = [
        canvas.get_assignment(row['course_id'], row['id'])
        for row in data['assignments']
    ]

    # Use the selected version and group, with active matched enrollments only.
    statistics = {}
    for assessment in data['assessments']:
        version = next(
            row for row in data['assignment_versions']
            if row['id'] == assessment['assignment_version_id']
        )
        group = next(
            row for row in data['student_groups']
            if row['id'] == assessment['student_group_id']
        )
        criterion = next(
            (row for row in version['payload'].get('rubric', [])
             if row['id'] == assessment['criterion_id']),
            None,
        )
        if criterion is None:
            statistics[assessment['id']] = None
            continue
        eligible = {
            row['student_id']
            for row in roster.get_roster(courses[assessment['course_id']]['id'])
            if row['status'] == 'active' and row['match_status'] == 'matched'
        }
        users = {
            row['canvas_user_id'] for row in data['students']
            if row['id'] in group['student_ids'] and row['id'] in eligible
        }
        submissions = [
            row for row in data['submissions']
            if row['assignment_id'] == assessment['assignment_id']
            and row['user_id'] in users
        ]
        statistics[assessment['id']] = calculate_pi_statistics(criterion, submissions)
    data['statistics'] = statistics
    data['evidence'] = build_evidence_candidates(data, roster)
    from .sample_reports import sample_report_catalog
    data["sample_reports"] = sample_report_catalog()
    return data


def load_dashboard_data():
    return prepare_dashboard_data(PortalDataFacade().load())
