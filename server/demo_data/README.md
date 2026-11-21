# Shared demo data

This folder centralizes the portal's shared fictional input files. The JSON records were prepared with generative AI for development and testing; they are not live Canvas, LionPath, SSO, or real student records.

| File | Purpose |
| --- | --- |
| canvas_assignment_with_rubric.json | Existing fictional assignment 501 and grading rubric. Its data is unchanged by this move. |
| canvas_assignment_submissions.json | Fictional graded submissions for report-generation demos. |
| canvas_course.json | Fictional course details for report-generation demos. |
| report_context.json | Fictional report context, PI mappings, and instructor comments. |
| portal_demo.json | Linked fictional records for the four dashboard roles, including campuses and course-campus assignments. |
| evidence_templates.json | Fictional student-work text and filename templates for evidence previews. |

Only the existing rubric preview and integration tests are connected to this folder in this PR. The additional datasets support later feature PRs; including a file does not implement its import, PDF generation, dashboard, or authentication workflow.

## Campus and provenance

The campus catalog contains University Park, Beaver, Brandywine, Hazleton, Erie / Behrend, and World Campus. These are real names; their course assignments are AI-generated fictional examples, not verified course availability or an exhaustive campus list. Sample faculty names do not imply real accounts or endorsements.

The base portal dataset has 2 semesters, 6 campuses, 10 course offerings, 11 sections, 30 students, 30 assessments, 31 assignment versions, 204 submissions, 20 mock report records, and 20 peer reviews.

Historical PDF catalog entries are user-supplied examples, not AI-generated reports. Their campus is unspecified until verified. Actual supplied PDFs belong in pdf_samples/ locally and are excluded from Git. No PDF originals are included in this PR.

## Data and code boundaries

Store reusable fictional input records and evidence templates here. Keep readers, calculations, connectors, and rendering code in their source modules. Tests may create temporary records; saved database edits and browser drafts are runtime state, not shared input files. Generated previews do not need to be stored here.

No live generative AI API runs when these fixtures are read. Keep these datasets for development and tests after real integrations arrive; do not treat them as production records.

## Existing assignment fixture notes

# Canvas assignment test data

canvas_assignment_with_rubric.json is a fictional Canvas response for one assignment. We use it to test how our backend reads assignment instructions, rubric criteria, and rating options without connecting to Canvas.

- id and course_id identify the assignment and its course. Both values are fictional and stores as strings.
- name and description contain the assignment title and instructions. Canvas can return the instructions as HTML.
- points_possible is the assignment's maximum score. rubric_settings.points_possible is the rubric's maximum score. Both happen to be 20 in this example.
- rubric contains one criterion. The 6.a prefix in its description is the example performance indicator (PI) code.
- rating lists the possible levels and points for thatc criterion. These are scoring options. The file contains no student grades or submissions.

# Sources:

- Instructure's Get a single assignment endpoint returns an Assignment object. The same page documents the RubricCriteria object and RubricRating object.
https://developerdocs.instructure.com/services/canvas/resources/assignments#assignment

Our test file combines those documented fields with fictional values.
