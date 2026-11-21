# File: test_import_mock_canvas_assignment.py
# Purpose: Checks the mock import command and repeated imports.

from io import StringIO
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.management import call_command, CommandError
from django.test import TestCase, override_settings

from .canvas_facade import get_mock_canvas_assignment
from .models import Assignment, AssignmentVersion, CanvasCourse, ImportRun, SourceRevision


@override_settings(DEBUG=True)
class MockAssignmentCommandTests(TestCase):
    def test_repeated_import_uses_facade_and_reuses_saved_version(self):
        outputs = []
        with patch(
            'integrations.management.commands.import_mock_canvas_assignment.get_mock_canvas_assignment',
            wraps=get_mock_canvas_assignment,
        ) as facade:
            for _ in range(2):
                output = StringIO()
                call_command('import_mock_canvas_assignment', stdout=output)
                outputs.append(output.getvalue())
            self.assertEqual(facade.call_count, 2)
            facade.assert_called_with(501)

        version = AssignmentVersion.objects.get()
        self.assertEqual(version.title, 'Demo Programming Assignment')
        self.assertEqual(version.source_revision.payload, get_mock_canvas_assignment(501))
        self.assertEqual(Assignment.objects.count(), 1)
        self.assertEqual(CanvasCourse.objects.count(), 1)
        self.assertEqual(SourceRevision.objects.count(), 1)
        self.assertEqual(ImportRun.objects.filter(status='completed').count(), 2)
        self.assertEqual(outputs[0], outputs[1])
        self.assertIn(str(version.pk), outputs[0])
        user = get_user_model().objects.get(username='portal-demo-importer')
        self.assertFalse(user.is_active)
        self.assertFalse(user.has_usable_password())

    @override_settings(DEBUG=False)
    def test_command_is_disabled_outside_development(self):
        with self.assertRaisesRegex(CommandError, 'only in development'):
            call_command('import_mock_canvas_assignment')
        self.assertFalse(ImportRun.objects.exists())
        self.assertFalse(get_user_model().objects.exists())

    def test_active_import_account_is_rejected(self):
        get_user_model().objects.create_user(username='portal-demo-importer', password='test-only')
        with self.assertRaisesRegex(CommandError, 'must be inactive'):
            call_command('import_mock_canvas_assignment')
        self.assertFalse(ImportRun.objects.exists())
        self.assertFalse(Assignment.objects.exists())
