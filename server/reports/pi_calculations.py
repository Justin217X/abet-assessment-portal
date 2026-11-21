"""
File: pi_calculations.py
Purpose: Calculates student performance statistics for PI Reports.

Processes rubric assessment scores and calculates student counts,
percentages, score statistics, and performance levels.

"""

from statistics import mean, median


PERFORMANCE_LEVELS = {
    'Beginning': 1,
    'Developing': 2,
    'Proficient': 3,
    'Exemplary': 4,
}


def calculate_pi_statistics(criterion, submissions):
    """
    Calculate performance statistics for a rubric criterion.

    Parameters:
        criterion (dict): Canvas rubric criterion and its ratings.
        submissions (list): Canvas student submission records.

    Returns:
        dict: Student distribution and performance statistics.
    """

    # Map Canvas rating IDs to their performance levels. [JH]
    rating_levels = {}
    levels = {}

    for rating in criterion['ratings']:
        label = rating['description']
        level = PERFORMANCE_LEVELS[label]

        rating_levels[rating['id']] = level

        levels[level] = {
            'level': level,
            'label': label,
            'max_score': rating['points'],
            'scores': [],
        }

    scores = []
    student_levels = []

    # Process graded submissions containing a rubric assessment. [JH]
    for submission in submissions:
        if submission.get('workflow_state') != 'graded':
            continue

        if submission.get('excused') or submission.get('missing'):
            continue

        assessment = submission.get('rubric_assessment') or {}
        result = assessment.get(criterion['id'])

        if not result or result.get('points') is None:
            continue

        points = result['points']
        level = rating_levels[result['rating_id']]

        levels[level]['scores'].append(points)
        scores.append(points)
        student_levels.append(level)

    total_students = len(scores)
    distribution = []

    # Calculate statistics for each performance level. [JH]
    for level in sorted(levels):
        level_data = levels[level]
        level_scores = level_data['scores']
        count = len(level_scores)

        distribution.append({
            'level': level,
            'label': level_data['label'],
            'student_count': count,
            'percentage': (
                count / total_students * 100
                if total_students else 0
            ),
            'average_score': mean(level_scores) if count else None,
            'max_score': level_data['max_score'],
        })

    # Use None when no scores are available. [JH]
    return {
        'total_students': total_students,
        'highest_supported_level': max(levels, default=None),
        'distribution': distribution,
        'min_score': min(scores) if scores else None,
        'max_score': max(scores) if scores else None,
        'median_score': median(scores) if scores else None,
        'mean_score': mean(scores) if scores else None,
        'mean_level': (
            mean(student_levels) if student_levels else None
        ),
    }
