# File: rubric_pdf.py
# Purpose: Builds a basic Rubric Report PDF from rubric preview fields.
# Table layout adapted from the team's ReportLab rubric generator. [JH]
# !!! Returns PDF bytes only. Downloads and access checks are separate work. [SD]

from io import BytesIO
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def generate_rubric_pdf(preview):
    output = BytesIO()
    document = SimpleDocTemplate(
        output, pagesize=letter, leftMargin=36, rightMargin=36,
        topMargin=36, bottomMargin=36, title='Rubric Report',
    )
    styles = getSampleStyleSheet()

    def paragraph(value, style='BodyText'):
        return Paragraph(escape(str(value or '')).replace('\n', '<br/>'), styles[style])

    story = [
        paragraph('Rubric Report', 'Title'),
        paragraph(preview['assignment_title'], 'Heading1'),
    ]
    if not preview['criteria']:
        story.append(paragraph('No rubric criteria were provided.'))

    for criterion in preview['criteria']:
        story.extend([
            paragraph(criterion['label'], 'Heading2'),
            paragraph(criterion.get('description')),
            paragraph(f'Maximum: {criterion["points"]} points'),
            Spacer(1, 8),
        ])
        rows = [[paragraph('Rating'), paragraph('Description'), paragraph('Points')]]
        for rating in criterion['ratings']:
            rows.append([
                paragraph(rating['label']),
                paragraph(rating.get('description')),
                paragraph(str(rating['points'])),
            ])
        if criterion['ratings']:
            table = Table(
                rows, colWidths=[document.width * .24, document.width * .61, document.width * .15],
                repeatRows=1, splitInRow=1,
            )
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#eaf0f7')),
                ('GRID', (0, 0), (-1, -1), .5, colors.HexColor('#cbd5e1')),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 8),
                ('RIGHTPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 7),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
            ]))
            story.append(table)
        else:
            story.append(paragraph('No ratings were provided.'))
        story.append(Spacer(1, 12))

    document.build(story)
    return output.getvalue()
