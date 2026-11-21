# File: test_seed_portal_demo.py
# Purpose: Checks shared demo seeding, repeat imports, and saved snapshot history.

from copy import deepcopy
from io import StringIO
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.management import call_command, CommandError
from django.test import TestCase, override_settings

from academics.models import Course, CourseSection, Semester
from .models import AssignmentVersion, CanvasCourse, ImportRun, SourceRevision
from .portal_data import DATASET_SOURCE_ID, MockPortalProvider, PortalDataFacade


@override_settings(DEBUG=True)
class SeedPortalDemoTests(TestCase):
    def seed(self, **options):
        output = StringIO()
        call_command('seed_portal_demo', stdout=output, **options)
        return output.getvalue()

    def snapshots(self):
        return SourceRevision.objects.filter(
            source_record__source_system='portal_demo',
            source_record__record_type='dataset',
            source_record__source_id=DATASET_SOURCE_ID,
        )

    def test_first_seed_can_be_read_by_saved_provider_and_repeat_is_unchanged(self):
        data = MockPortalProvider().load()
        self.assertIn('Saved demo dataset', self.seed())
        self.assertEqual(self.snapshots().get().payload, data)
        with override_settings(PORTAL_DATA_PROVIDER='saved_mock'):
            loaded = PortalDataFacade().load()
        self.assertEqual(loaded['courses'], data['courses'])
        self.assertEqual(loaded['campuses'], data['campuses'])
        self.assertEqual(Course.objects.count(), len({c['course_code'] for c in data['courses']}))
        self.assertEqual(CanvasCourse.objects.count(), len(data['courses']))
        self.assertEqual(CourseSection.objects.count(), len(data['sections']))
        self.assertEqual(Semester.objects.count(), len(data['semesters']))
        self.assertEqual(AssignmentVersion.objects.count(), len(data['assignment_versions']))
        counts = (ImportRun.objects.count(), SourceRevision.objects.count(), AssignmentVersion.objects.count())
        self.assertIn('already saved', self.seed())
        self.assertEqual(counts, (ImportRun.objects.count(), SourceRevision.objects.count(), AssignmentVersion.objects.count()))
        user = get_user_model().objects.get(username='portal-demo-importer')
        self.assertFalse(user.is_active)
        self.assertFalse(user.has_usable_password())

    def test_changed_dataset_adds_snapshot_without_reimporting_unchanged_assignments(self):
        self.seed()
        original = self.snapshots().get()
        changed = deepcopy(original.payload)
        changed['users'][0]['name'] = 'Changed fictional profile'
        assignment_count = AssignmentVersion.objects.count()
        with patch(
            'integrations.management.commands.seed_portal_demo.MockPortalProvider.load',
            return_value=changed,
        ):
            self.seed()
        self.assertEqual(self.snapshots().count(), 2)
        self.assertEqual(self.snapshots().order_by('-revision_number').first().payload, changed)
        original.refresh_from_db()
        self.assertNotEqual(original.payload['users'][0]['name'], changed['users'][0]['name'])
        self.assertEqual(AssignmentVersion.objects.count(), assignment_count)

    @override_settings(DEBUG=False)
    def test_disabled_outside_development(self):
        with self.assertRaisesRegex(CommandError, 'only in development'):
            self.seed()
        self.assertFalse(ImportRun.objects.exists())
        self.assertFalse(get_user_model().objects.exists())

    def test_unknown_owner_is_rejected_without_saving(self):
        with self.assertRaisesRegex(CommandError, 'does not exist'):
            self.seed(username='not-a-local-user')
        self.assertFalse(ImportRun.objects.exists())

    def test_existing_owner_can_be_selected(self):
        user = get_user_model().objects.create_user(username='local-demo-owner')
        self.seed(username=user.username)
        self.assertEqual(ImportRun.objects.get().requested_by, user)

    def test_default_importer_cannot_be_an_active_sign_in_account(self):
        get_user_model().objects.create_user(username='portal-demo-importer', password='test-only')
        with self.assertRaisesRegex(CommandError, 'already used'):
            self.seed()
        self.assertFalse(ImportRun.objects.exists())
        self.assertFalse(Course.objects.exists())
