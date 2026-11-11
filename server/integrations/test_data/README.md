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