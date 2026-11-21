# File: rubric_preview.py
# Purpose: Prepares rubric information from a saved assignment version.
#
# Reads the assignment title, criteria, ratings, and points.
# Does not contact Canvas or change saved records.
#
# !!! Keep this helper when real Canvas data is connected. [SD]
# !!! Check incoming data before saving it; this helper expects
# required fields such as criterion IDs, descriptions, and points. [SD]

def build_rubric_preview(assignment_version):

    # Read the rubric from the same saved version as the assignment title.
    payload = assignment_version.source_revision.payload
    criteria = []

    # Prepare each rubric criterion and its rating options.
    # Use an empty list when no rubric is available.
    for criterion in payload.get('rubric') or []:
        criteria.append({
            'id': criterion['id'],
            'label': criterion['description'],
            'description': criterion.get('long_description', ''),
            'points': criterion['points'],
            'ratings': [
                {
                    'label': rating['description'],
                    'description': rating.get('long_description', ''),
                    'points': rating['points'],
                }
                for rating in (criterion.get('ratings') or [])
            ],
        })

    # Return the report fields without returning the full Canvas response.
    return {
        'assignment_title': assignment_version.title,
        'use_rubric_for_grading': payload.get('use_rubric_for_grading'),
        'criteria': criteria,
    }
