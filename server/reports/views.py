"""
File: views.py
Purpose: Handles assessment report previews and PDF download requests.
"""

from django.conf import settings
from django.http import Http404, HttpResponse, JsonResponse
from django.views.decorators.http import require_GET

from .demo_data import load_demo_pi_report, load_demo_rubric_report
from .pi_pdf import generate_pi_pdf
from .rubric_pdf import generate_rubric_pdf


@require_GET
def demo_rubric_report(request):
    """Generate and download the fictional Rubric Report."""

    # Restrict demo endpoints to development mode. [JH]
    if not settings.DEBUG:
        raise Http404

    data = load_demo_rubric_report()
    pdf = generate_rubric_pdf(data)

    response = HttpResponse(pdf, content_type='application/pdf')

    # Content-Disposition tells the browser to download the PDF. [JH]
    response['Content-Disposition'] = (
        'attachment; filename="rubric_report.pdf"'
    )

    return response


@require_GET
def demo_pi_report(request):
    """Generate and download the fictional PI Report."""

    if not settings.DEBUG:
        raise Http404

    data = load_demo_pi_report()
    pdf = generate_pi_pdf(data)

    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = (
        'attachment; filename="pi_report.pdf"'
    )

    return response


@require_GET
def demo_pi_preview(request):
    """Return fictional PI Report data for the frontend preview."""

    if not settings.DEBUG:
        raise Http404

    return JsonResponse(load_demo_pi_report())
