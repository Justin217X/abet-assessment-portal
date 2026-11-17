
"""
File: rubric_pdf.py
Purpose: Generates Instrument Grading Rubric reports using ReportLab.

Includes course and assignment information, rubric criteria, rating
levels, point values, and associated performance indicators.
The generated PDF is stored in memory for download.

"""

from io import BytesIO
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


def generate_rubric_pdf(data):
    """
    Generate a Rubric Report from prepared assessment data.

    Parameters:
        data: Course, assignment, rubric, and PI information.

    Returns:
        Contents of the generated PDF.
    """
    
    # Store the PDF in memory. [JH]
    buffer = BytesIO()

    # US Letter page with half-inch margins.
    # ReportLab uses points (72 points = 1 inch). [JH]
    document = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
        title='Instrument Grading Rubric',
    )

    styles = getSampleStyleSheet()

    # Table cell text style. Leading is the spacing between lines. [JH]
    cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
    )

    def cell(text):
        """Create a table cell with wrapped and escaped text."""
        return Paragraph(escape(str(text)), cell_style)

    # Document elements in the order they appear in the PDF. [JH]
    story = []

    # -------------------- Report Title --------------------

    program = data['program']['code']

    story.append(
        Paragraph(
            f'({escape(program)}) Instrument Grading Rubric',
            styles['Title'],
        )
    )

    # ---------------- Course and Assignment ----------------

    course = data['course']

    course_information = (
        f'{course["course_code"]}, '
        f'Section {data["section"]}: '
        f'{course["name"]}'
    )

    story.append(
        Paragraph(
            escape(course_information),
            styles['Normal'],
        )
    )

    story.append(
        Paragraph(
            escape(f'Assignments > {data["assignment_title"]}'),
            styles['Normal'],
        )
    )

    story.append(Spacer(1, 16))

    # -------------------- Rubric Table --------------------

    # Each inner list represents a row in the table.
    # The first row contains the column headings. [JH]
    rows = [
        [
            cell('Criteria'),
            cell('Ratings'),
            cell('Points'),
        ]
    ]
    
    # Create a table row for each rubric criterion. [JH]
    for criterion in data['criteria']:
        criterion_text = criterion['label']

        if criterion.get('description'):
            criterion_text += '\n' + criterion['description']

        # escape() prevents text from being interpreted as markup.
        # ReportLab uses <br/> for line breaks. [JH]
        criterion_cell = Paragraph(
            escape(criterion_text).replace('\n', '<br/>'),
            cell_style,
        )

        ratings = []

        for rating in criterion['ratings']:
            rating_text = (
                f'<b>{escape(str(rating["points"]))} pts - '
                f'{escape(rating["label"])}</b>'
            )

            if rating.get('description'):
                rating_text += (
                    '<br/>' + escape(rating['description'])
                )

            ratings.append(rating_text)

        # Display all ratings for a criterion in the same cell. [JH]
        ratings_cell = Paragraph(
            '<br/><br/>'.join(ratings),
            cell_style,
        )

        rows.append([
            criterion_cell,
            ratings_cell,
            cell(criterion['points']),
        ])
    
    # -------------------- Table Formatting --------------------

    # Column widths: Criteria (32%), Ratings (56%), Points (12%).
    # repeatRows repeats the header on subsequent pages.
    # splitInRow allows rows to span multiple pages. [JH]
    table = Table(
        rows,
        colWidths=[
            document.width * 0.32,
            document.width * 0.56,
            document.width * 0.12,
        ],
        repeatRows=1,
        splitInRow=1,
    )

    # TableStyle coordinates follow (column, row).
    # Index -1 refers to the last column or row. [JH]
    table.setStyle(TableStyle([
        (
            'BACKGROUND', (0, 0), (-1, 0),
            colors.HexColor('#E5E7EB'),
        ),
        (
            'GRID', (0, 0), (-1, -1),
            0.5, colors.HexColor('#808080'),
        ),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))

    story.append(table)
    story.append(Spacer(1, 12))

    # -------------------- Total Points --------------------

    story.append(
        Paragraph(
            f'<b>Total Points:</b> '
            f'{escape(str(data["total_points"]))}',
            styles['Normal'],
        )
    )

    story.append(Spacer(1, 16))

    # ---------------- Performance Indicators ----------------

    story.append(
        Paragraph(
            'Performance Indicators (PIs)',
            styles['Heading2'],
        )
    )

    for indicator in data['performance_indicators']:
        text = (
            f'{indicator["code"]}: '
            f'{indicator["description"]}'
        )

        story.append(
            Paragraph(escape(text), styles['Normal'])
        )

    # -------------------- PDF Generation --------------------

    # Build the PDF and return its contents as bytes. [JH]
    document.build(story)

    return buffer.getvalue()
