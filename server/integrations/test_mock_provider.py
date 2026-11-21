# File: test_mock_provider.py
# Purpose: Checks shared JSON and saved-snapshot mock data sources.

from datetime import datetime, timezone as datetime_timezone
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.exceptions import ImproperlyConfigured
from django.test import TestCase, override_settings
from django.utils import timezone

from .models import ImportRun, SourceRecord, SourceRevision
from .portal_data import DATASET_SOURCE_ID, MockPortalProvider, PortalDataFacade


@override_settings(PORTAL_DATA_PROVIDER='mock')
class SharedMockProviderTests(TestCase):
    def test_json_source_returns_shared_records_and_independent_copies(self):
        first = MockPortalProvider().load()
        expected_name = first['courses'][0]['name']
        self.assertTrue(first['metadata']['fictional'])
        self.assertEqual(first['metadata']['provenance']['method'], 'generative_ai')
        self.assertEqual(len(first['campuses']), 6)
        first['courses'][0]['name'] = 'Caller change'
        self.assertEqual(MockPortalProvider().load()['courses'][0]['name'], expected_name)

    def test_facade_adds_current_date_without_changing_scenario_date(self):
        fixed = datetime(2030, 1, 2, 12, tzinfo=datetime_timezone.utc)
        with patch('integrations.portal_data.timezone.localdate', return_value=fixed.date()):
            data = PortalDataFacade().load()
        self.assertEqual(data['metadata']['current_date'], '2030-01-02')
        self.assertEqual(data['metadata']['as_of'], '2026-11-19')
        self.assertNotIn('current_date', MockPortalProvider().load()['metadata'])

    @override_settings(PORTAL_DATA_PROVIDER='saved_mock')
    def test_saved_source_requires_a_snapshot_without_silent_fallback(self):
        with self.assertRaisesRegex(ImproperlyConfigured, 'No saved mock dataset'):
            PortalDataFacade().load()

    @override_settings(PORTAL_DATA_PROVIDER='saved_mock')
    def test_saved_source_reads_latest_snapshot_without_modifying_history(self):
        user = get_user_model().objects.create_user(username='provider-test', is_active=False)
        run = ImportRun.objects.create(requested_by=user, import_kind='portal_demo', status='completed')
        source = SourceRecord.objects.create(
            source_system='portal_demo', record_type='dataset', source_id=DATASET_SOURCE_ID,
        )
        for number in [1, 2]:
            data = MockPortalProvider().load()
            data['metadata']['snapshot_number'] = number
            SourceRevision.objects.create(
                source_record=source, import_run=run, revision_number=number,
                retrieved_at=timezone.now(), payload=data,
            )
        result = PortalDataFacade().load()
        self.assertEqual(result['metadata']['snapshot_number'], 2)
        result['courses'][0]['name'] = 'Changed'
        again = PortalDataFacade().load()
        self.assertNotEqual(again['courses'][0]['name'], 'Changed')
        self.assertEqual(SourceRevision.objects.count(), 2)
        self.assertNotIn('current_date', source.revisions.get(revision_number=2).payload['metadata'])

    @override_settings(PORTAL_DATA_PROVIDER='live')
    def test_unimplemented_source_raises_clear_error(self):
        with self.assertRaisesRegex(ImproperlyConfigured, 'not implemented'):
            PortalDataFacade()

    def test_explicit_provider_can_be_supplied(self):
        class TestProvider:
            def load(self):
                return {'metadata': {'fictional': True}, 'courses': []}
        self.assertEqual(PortalDataFacade(provider=TestProvider()).load()['courses'], [])
