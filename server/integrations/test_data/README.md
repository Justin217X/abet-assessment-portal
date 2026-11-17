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

# Additional Report Generation Test Data

The following fictional data files support the development and testing of the Rubric Report and Performance Indicator (PI) Report generators.

## canvas_assignment_submissions.json

Simulates a Canvas assignment submissions response with rubric assessments included.

The file contains 30 fictional graded submissions associated with assignment 501 and rubric criterion crit1.

Performance distribution:

- Beginning: 2 students
- Developing: 4 students
- Proficient: 9 students
- Exemplary: 15 students

## canvas_course.json

Contains fictional course information associated with course 101.

## report_context.json

Contains portal-specific report information, including the academic program, section, instructor, semester, performance indicator mappings, and instructor comments.

This file does not represent a Canvas API response.

## Limitations

- All records and identifiers are fictional.
- All students belong to the same assessment group.
- The assignment contains one rubric criterion.
- Student submission attachments are not included.
- No live Canvas connection is required.

## Additional Sources

Canvas Submissions API:
https://developerdocs.instructure.com/services/canvas/resources/submissions

Canvas Courses API:
https://developerdocs.instructure.com/services/canvas/resources/courses
