"""
File: pi_pdf.py
Purpose: Generates Performance Indicator (PI) reports using ReportLab.

Includes course and assignment information, student performance
distribution, score statistics, and instructor comments.

"""

from io import BytesIO
from math import ceil
from xml.sax.saxutils import escape

from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.shapes import Drawing
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


def format_number(value):
    """Format a number to two decimal places."""
    return 'N/A' if value is None else f'{value:.2f}'


def build_performance_chart(distribution):
    """Create a bar chart of student counts by performance level."""

    counts = [level['student_count'] for level in distribution]
    labels = [str(level['level']) for level in distribution]

    # Drawing acts as the container for the chart. [JH]
    drawing = Drawing(520, 220)

    chart = VerticalBarChart()
    chart.x = 45
    chart.y = 35
    chart.width = 450
    chart.height = 160

    # ReportLab accepts chart data as a list of data series. [JH]
    chart.data = [counts]
    chart.categoryAxis.categoryNames = labels

    # Scale the vertical axis based on the largest student count. [JH]
    highest_count = max(counts, default=0)
    step = max(1, ceil(highest_count / 5))

    chart.valueAxis.valueMin = 0
    chart.valueAxis.valueMax = (highest_count // step + 1) * step
    chart.valueAxis.valueStep = step

    chart.bars[0].fillColor = colors.HexColor('#407EAE') # Blue
    chart.bars[0].strokeColor = None # No border

    # Display student counts 8 points above the bars. [JH]
    chart.barLabelFormat = '%d'
    chart.barLabels.fontSize = 10
    chart.barLabels.nudge = 8

    drawing.add(chart)

    return drawing


def generate_pi_pdf(data):
    """
    Generate a PI Report from prepared assessment data.

    Parameters:
        data (dict): Course, assignment, PI, and statistical information.

    Returns:
        bytes: Contents of the generated PDF.
    """

    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
        title='Performance Indicator Report',
    )

    styles = getSampleStyleSheet()
    story = []

    program = data['program']['code']
    course = data['course']
    indicator = data['performance_indicator']
    statistics = data['statistics']

    # -------------------- Report Title --------------------

    title = (
        f'({program}) {indicator["code"]} - '
        f'{data["assignment_title"]}'
    )

    story.append(Paragraph(escape(title), styles['Title']))

    # ---------------- Course and Assignment ----------------

    course_information = (
        f'{course["course_code"]}, '
        f'Section {data["section"]}: '
        f'{course["name"]}'
    )

    story.append(
        Paragraph(escape(course_information), styles['Normal'])
    )

    story.append(
        Paragraph(
            escape(f'Instructor: {data["instructor"]}'),
            styles['Normal'],
        )
    )

    story.append(Spacer(1, 16))

    # -------------------- Performance Chart --------------------

    story.append(
        Paragraph('Student Performance', styles['Heading2'])
    )

    distribution = statistics['distribution']

    if distribution:
        story.append(build_performance_chart(distribution))
    else:
        story.append(
            Paragraph(
                'No performance levels available.',
                styles['Normal'],
            )
        )

    # ---------------- Performance Indicator ----------------

    story.append(
        Paragraph(
            'Performance Indicators (PIs)',
            styles['Heading2'],
        )
    )

    indicator_text = (
        f'({program}) {indicator["code"]}: '
        f'{indicator["description"]}'
    )

    story.append(
        Paragraph(escape(indicator_text), styles['Normal'])
    )

    story.append(Spacer(1, 10))

    total_students = statistics['total_students']
    highest_level = statistics['highest_supported_level']

    if highest_level is None:
        highest_level = 'N/A'

    story.append(
        Paragraph(
            f'Total number of students: {total_students}',
            styles['Normal'],
        )
    )

    story.append(
        Paragraph(
            f'Instrument\'s highest supported level: {highest_level}',
            styles['Normal'],
        )
    )

    story.append(Spacer(1, 10))

    # ---------------- Student Achievement Table ----------------

    story.append(
        Paragraph('Student Achievements', styles['Heading2'])
    )

    rows = [
        [
            'Level',
            'Students',
            '%',
            'AVG Score',
            'MAX Level Score',
        ]
    ]

    # Add the calculated statistics for each performance level. [JH]
    for level in distribution:
        rows.append([
            f'{level["level"]}: {level["label"]}',
            str(level['student_count']),
            f'{level["percentage"]:.2f}%',
            format_number(level['average_score']),
            format_number(level['max_score']),
        ])

    table = Table(
        rows,
        colWidths=[
            document.width * 0.26,
            document.width * 0.15,
            document.width * 0.15,
            document.width * 0.19,
            document.width * 0.25,
        ],
        repeatRows=1,
    )

    # TableStyle coordinates follow (column, row).
    # Index -1 refers to the last column or row. [JH]
    table.setStyle(TableStyle([
        (
            'BACKGROUND', (0, 0), (-1, 0),
            colors.HexColor('#E5E7EB'), # Light gray
        ),
        (
            'GRID', (0, 0), (-1, -1),
            0.5, colors.HexColor('#808080'), # Gray
        ),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
    ]))

    story.append(table)
    story.append(Spacer(1, 12))

    # -------------------- Score Statistics --------------------

    min_score = format_number(statistics['min_score'])
    median_score = format_number(statistics['median_score'])
    max_score = format_number(statistics['max_score'])
    mean_score = format_number(statistics['mean_score'])
    mean_level = format_number(statistics['mean_level'])

    story.append(
        Paragraph(
            'Score statistics (min / median / max): '
            f'{min_score} / {median_score} / {max_score} pts',
            styles['Normal'],
        )
    )

    story.append(Spacer(1, 6))

    story.append(
        Paragraph(
            'Cohort (mean performance level / mean score): '
            f'{mean_level} avg level / {mean_score} avg pts',
            styles['Normal'],
        )
    )

    story.append(Spacer(1, 10))

    # ---------------- Instructor Comments ----------------

    story.append(Paragraph('Comments', styles['Heading2']))

    comments = data['instructor_comments'] or 'No comments provided.'

    story.append(
        Paragraph(
            escape(comments).replace('\n', '<br/>'),
            styles['Normal'],
        )
    )

    # -------------------- PDF Generation --------------------

    document.build(story)

    return buffer.getvalue()
