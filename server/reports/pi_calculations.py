# File: pi_calculations.py
# Purpose: Calculates counts, percentages, and scores for one rubric criterion.
#
# Uses graded submissions. Excludes missing, excused, and unscored work.
# A score of zero is included.
#
# !!! The caller must supply submissions for the correct assignment and student group. [SD]
# !!! Each counted submission is treated as one student; duplicates are not removed here. [SD]
# !!! Rating labels must match the names in PERFORMANCE_LEVELS exactly. [SD]
# !!! Each scored result must contain a rating_id listed in the criterion. [SD]
#
# !!! TODO: Support other approved rating names, scales, and score ranges. [SD]
# !!! Keep this calculation code when live data is connected. [SD]

from statistics import mean, median


# Convert the current rating names into numbered performance levels.
# !!! This mapping is not suitable for every possible Canvas rubric.
PERFORMANCE_LEVELS = {
    'Beginning': 1,
    'Developing': 2,
    'Proficient': 3,
    'Exemplary': 4,
}


def calculate_pi_statistics(criterion, submissions):
    # Calculate performance statistics for a rubric criterion.
    #
    # Parameters:
    #     criterion (dict): Canvas rubric criterion and its ratings.
    #     submissions (list): Canvas student submission records.
    #
    # Returns:
    #     dict: Student distribution and performance statistics.

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

    # Use graded submissions with a score for this criterion. [JH]
    for submission in submissions:
        if submission.get('workflow_state') != 'graded':
            continue

        # Exclude excused and missing work. A numeric zero score can still count.
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

    # Count the submissions that passed the checks above.
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

    # Use None for score statistics when no scores are available. [JH]
    # highest_supported_level comes from the rubric, not the highest score earned.
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
