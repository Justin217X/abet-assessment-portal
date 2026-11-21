# File: evidence_pdf.py
# Purpose: Creates PDF previews of fictional student work.
#
# Change PDF text styles, spacing, and footer layout in this file.
# This creates the PDF in memory; it does not save a file in the archive.
#
# !!! These previews are not original Canvas files or official assessment reports. [SD]
# !!! TODO: Use approved original files in the live evidence workflow. [SD]
# !!! Keep this renderer for demo previews and tests, not as a replacement for real work. [SD]
# !!! File access checks belong in the Django request handler, not this layout code. [SD]

from io import BytesIO
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer


def generate_evidence_pdf(data, evidence):

    # Create a preview, without claiming the fictional text is a Canvas attachment.
    # Find the assessment, saved assignment version, student, course, and rubric criterion.
    assessment = next(row for row in data['assessments'] if row['id'] == evidence['assessment_id'])
    version = next(row for row in data['assignment_versions'] if row['id'] == assessment['assignment_version_id'])
    student = next(row for row in data['students'] if row['id'] == evidence['student_id'])
    course = next(row for row in data['courses'] if row['id'] == assessment['course_id'])
    criterion = next((row for row in version['payload'].get('rubric', []) if row['id'] == assessment['criterion_id']), None)

    # Set the fonts, colors, spacing, and notice box used in this PDF.
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle('EvidenceTitle', parent=styles['Title'], fontSize=20, leading=24, textColor=colors.HexColor('#17365c'), spaceAfter=12))
    styles.add(ParagraphStyle('EvidenceNotice', parent=styles['BodyText'], backColor=colors.HexColor('#eef3f8'), borderPadding=9, spaceAfter=15))
    styles.add(ParagraphStyle('EvidenceBody', parent=styles['BodyText'], fontSize=10, leading=15, spaceAfter=8))
    styles.add(ParagraphStyle('EvidenceCode', parent=styles['EvidenceBody'], fontName='Courier', fontSize=9, leading=14, splitLongWords=True))
    styles.add(ParagraphStyle('EvidenceFooter', parent=styles['Normal'], fontSize=8, textColor=colors.HexColor('#526176'), alignment=TA_CENTER))

    # Show supplied text safely and preserve its line breaks.
    def paragraph(value, style='EvidenceBody'):
        return Paragraph(escape(str(value)).replace('\n', '<br/>'), styles[style])

    # Show a score only when both the earned and maximum points are available.
    score = evidence.get('criterion_score')
    maximum = evidence.get('criterion_max')
    score_label = f'{score}/{maximum}' if score is not None and maximum is not None else 'Unavailable'

    # Add the fictional-data notice and report details before the work and feedback.
    content = [
        paragraph('Fictional Student Work', 'EvidenceTitle'),
        paragraph('GENERATIVE AI MOCK DATA - for development and UI review only. This PDF is generated from the fictional example text. It is not an original Canvas attachment or an official assessment report.', 'EvidenceNotice'),
        paragraph(version['payload']['name'], 'Heading2'),
        paragraph(f'Course: {course["course_code"]}'),
        paragraph(f'Student: {student["display_label"]}'),
        paragraph(f'Rubric score: {score_label}'),
    ]
    if criterion:
        content.append(paragraph(f'Criterion: {criterion.get("description", assessment["criterion_id"])}'))
    content.extend([
        paragraph(f'Mock source filename: {evidence["filename"]}'),
        paragraph(f'Example ID: {evidence["id"]}'),
        Spacer(1, 0.12 * inch),
        paragraph('Student work', 'Heading2'),
        paragraph(evidence['content'], 'EvidenceCode'),
        Spacer(1, 0.12 * inch),
        paragraph('Instructor feedback', 'Heading2'),
        paragraph(evidence.get('instructor_feedback') or 'No feedback provided.'),
    ])

    # Draw a separator and page number on every page.
    def footer(canvas, document):
        canvas.saveState()
        canvas.setStrokeColor(colors.HexColor('#cbd5e1'))
        canvas.line(document.leftMargin, 0.65 * inch, letter[0] - document.rightMargin, 0.65 * inch)
        label = Paragraph(f'Fictional student-work preview | Page {document.page}', styles['EvidenceFooter'])
        label.wrap(document.width, 0.3 * inch)
        label.drawOn(canvas, document.leftMargin, 0.4 * inch)
        canvas.restoreState()

    # Build a US Letter PDF in memory and return its bytes to the request handler.
    output = BytesIO()
    document = SimpleDocTemplate(output, pagesize=letter, rightMargin=0.65 * inch, leftMargin=0.65 * inch,
                                 topMargin=0.65 * inch, bottomMargin=0.85 * inch,
                                 title=f'Fictional work - {student["display_label"]}', author='ABET Portal Development Demo')
    document.build(content, onFirstPage=footer, onLaterPages=footer)
    return output.getvalue()
