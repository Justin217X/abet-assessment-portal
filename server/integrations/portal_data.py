# File: portal_data.py
# Purpose: Loads shared demo records and prepares results for portal pages.
#
# !!! Live university sources are not connected. Both available sources contain fictional data. [SD]

import json
from pathlib import Path

from django.utils import timezone
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

from .models import SourceRevision

DATASET_PATH = Path(__file__).resolve().parent.parent / 'demo_data' / 'portal_demo.json'
DATASET_SOURCE_ID = 'portal-demo-v1'


class MockPortalProvider:

    # Read a fresh fixture so callers cannot change another request's data.
    def load(self):
        with DATASET_PATH.open(encoding='utf-8') as stream:
            return json.load(stream)


class SavedMockPortalProvider:

    # Read the latest snapshot saved by seed_portal_demo.
    def load(self):
        revision = SourceRevision.objects.filter(
            source_record__source_system='portal_demo',
            source_record__record_type='dataset',
            source_record__source_id=DATASET_SOURCE_ID,
        ).order_by('-revision_number').first()
        if revision is None:
            raise ImproperlyConfigured('No saved mock dataset is available. Import a demo snapshot first.')
        # Apply local demo edits only when reading the saved mock source.
        from .demo_updates import merge_demo_updates
        return merge_demo_updates(revision.payload)


class PortalDataFacade:

    # Keep pages independent of fixture and database storage choices.
    def __init__(self, provider=None):
        if provider is not None:
            self.provider = provider
            return
        providers = {'mock': MockPortalProvider, 'saved_mock': SavedMockPortalProvider}
        provider_type = providers.get(settings.PORTAL_DATA_PROVIDER)
        if provider_type is None:
            raise ImproperlyConfigured('The selected portal data provider is not implemented.')
        self.provider = provider_type()

    def load(self):
        # Dashboard preparation is added separately; both sources remain fictional.
        data = self.provider.load()
        data['metadata']['current_date'] = timezone.localdate().isoformat()
        return data
