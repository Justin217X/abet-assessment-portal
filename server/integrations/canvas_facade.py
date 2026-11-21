# File: canvas_facade.py
# Purpose: Provides one place to request the fictional Canvas assignment.
# !!! Uses shared demo data only; live Canvas access is not connected. [SD]

import json
from pathlib import Path


def get_mock_canvas_assignment(assignment_id):
    # Read a fresh copy so callers cannot change later requests.
    fixture_path = (
        Path(__file__).resolve().parent.parent
        / 'demo_data'
        / 'canvas_assignment_with_rubric.json'
    )
    with fixture_path.open(encoding='utf-8') as fixture:
        assignment = json.load(fixture)

    if str(assignment_id) != str(assignment['id']):
        raise LookupError('Canvas assignment not found in mock data.')

    return assignment
