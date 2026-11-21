"""
File: demo_data.py
Purpose: Loads and prepares fictional assessment data for report generation.

Used to test report generation without a live Canvas connection or database records.

"""

import json
from pathlib import Path
from types import SimpleNamespace

from integrations.rubric_preview import build_rubric_preview
from reports.pi_calculations import calculate_pi_statistics


# Path to the fictional assessment data. [JH]
TEST_DATA_DIR = (
    Path(__file__).resolve().parent.parent
    / 'demo_data'
)


def load_fixture(filename):
    """Load assessment data from a JSON file."""
    with (TEST_DATA_DIR / filename).open(encoding='utf-8') as file:
        return json.load(file)


def load_demo_rubric_report():
    """Prepare fictional data for the Rubric Report."""
    assignment = load_fixture('canvas_assignment_with_rubric.json')
    course = load_fixture('canvas_course.json')
    context = load_fixture('report_context.json')

    # Simulate a saved assignment version. [JH]
    assignment_version = SimpleNamespace(
        title=assignment['name'],
        source_revision=SimpleNamespace(payload=assignment),
    )

    # Use the existing rubric preview. [JH]
    rubric = build_rubric_preview(assignment_version)

    # Combine Canvas data with portal-specific report information. [JH]
    return {
        'program': context['program'],
        'course': course,
        'semester': context['semester'],
        'section': context['section'],
        'instructor': context['instructor'],
        'assignment_title': rubric['assignment_title'],
        'criteria': rubric['criteria'],
        'total_points': assignment['rubric_settings']['points_possible'],
        'performance_indicators': context['performance_indicators'],
    }


def load_demo_pi_report():
    """Prepare fictional data for the PI Report."""
    assignment = load_fixture('canvas_assignment_with_rubric.json')
    course = load_fixture('canvas_course.json')
    context = load_fixture('report_context.json')
    submissions = load_fixture('canvas_assignment_submissions.json')

    # Select the PI and its associated rubric criterion. [JH]
    indicator = context['performance_indicators'][0]

    criterion = next(
        criterion
        for criterion in assignment['rubric']
        if criterion['id'] == indicator['criterion_ids'][0]
    )

    statistics = calculate_pi_statistics(criterion, submissions)

    return {
        'program': context['program'],
        'course': course,
        'semester': context['semester'],
        'section': context['section'],
        'instructor': context['instructor'],
        'assignment_title': assignment['name'],
        'performance_indicator': indicator,
        'statistics': statistics,
        'instructor_comments': context['instructor_comments'],
    }
