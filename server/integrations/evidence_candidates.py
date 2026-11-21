# File: evidence_candidates.py
# Purpose: Builds fictional student-work choices from eligible graded submissions.
# !!! Suggested ordering is a demo convenience, not an approved selection rule. [SD]
# !!! No real attachments are retrieved or files saved here. [SD]

import copy
import json
from pathlib import Path
from statistics import median


def build_evidence_candidates(data, roster_connector):
    # Read shared fictional text from the demo data folder.
    template_path = Path(__file__).resolve().parent.parent / 'demo_data' / 'evidence_templates.json'
    with template_path.open(encoding='utf-8') as stream:
        templates = json.load(stream)
    result = []
    for assessment in data['assessments']:
        version = next(row for row in data['assignment_versions'] if row['id'] == assessment['assignment_version_id'])
        criterion = next((row for row in version['payload'].get('rubric', []) if row['id'] == assessment['criterion_id']), None)
        group = next(row for row in data['student_groups'] if row['id'] == assessment['student_group_id'])
        eligible = {row['student_id'] for row in roster_connector.get_roster(assessment['course_id']) if row['status'] == 'active' and row['match_status'] == 'matched'} & set(group['student_ids'])
        students = {row['canvas_user_id']: row for row in data['students'] if row['id'] in eligible}
        scored = []
        for submission in data['submissions']:
            if submission['assignment_id'] != assessment['assignment_id'] or submission['user_id'] not in students or submission.get('workflow_state') != 'graded' or submission.get('missing') or submission.get('excused') or criterion is None:
                continue
            score = (submission.get('rubric_assessment') or {}).get(criterion['id'], {}).get('points')
            if isinstance(score, (int, float)):
                scored.append((score, students[submission['user_id']], submission))
        original = [copy.deepcopy(row) for row in data['evidence'] if row['assessment_id'] == assessment['id']]
        scored_by_student = {student['id']: score for score, student, _ in scored}
        for row in original:
            row.update(criterion_score=scored_by_student.get(row['student_id']), criterion_max=criterion['points'] if criterion else None, eligible=row['student_id'] in scored_by_student, suggested=False)
        midpoint = median([row[0] for row in scored]) if scored else 0
        for band in ['high', 'middle', 'low']:
            ordered = sorted(scored, key=lambda row: ((-row[0] if band == 'high' else row[0] if band == 'low' else abs(row[0] - midpoint)), row[1]['id']))
            for index, (score, student, submission) in enumerate(ordered):
                existing = next((row for row in original if row['student_id'] == student['id'] and row['band'] == band), None)
                if existing:
                    existing['suggested'] = index == 0
                    continue
                comments = submission.get('submission_comments') or []
                feedback = ' '.join(comment.get('comment', '') for comment in comments)
                original.append({
                    'id': f'{assessment["id"]}-candidate-{band}-{student["id"]}', 'assessment_id': assessment['id'],
                    'submission_id': submission['id'], 'student_id': student['id'], 'band': band,
                    'selected': False, 'file_available': False, 'filename': templates['filename_template'].format(assignment_id=assessment['assignment_id'], student_id=student['id']),
                    'media_type': 'text/plain', 'content': templates['content_template'].format(student_label=student['display_label'], assignment_title=version['payload']['name'], score=score, criterion_max=criterion['points']),
                    'instructor_feedback': feedback or templates['feedback_fallback'], 'criterion_score': score,
                    'criterion_max': criterion['points'], 'eligible': True, 'suggested': index == 0,
                })
        result.extend(original)
    return result
