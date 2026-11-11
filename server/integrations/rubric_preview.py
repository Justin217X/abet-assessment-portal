"""
File: rubric_preview.py
Purpose: Prepares rubric data from a saved assignment version.
"""
def build_rubric_preview(assignment_version):
    # Read the rubric from the same saved version as the assignment title. [SD]
    payload = assignment_version.source_revision.payload
    criteria = []

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

    # Return the report fields without returning the full Canvas response. [SD]
    return {
        'assignment_title': assignment_version.title,
        'use_rubric_for_grading': payload.get('use_rubric_for_grading'),
        'criteria': criteria,
    }