from .settings import *

# Use a separate account and test database for running tests. [SD]
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'abet_portal_test',
        'USER': os.environ['TEST_DB_USER'],
        'PASSWORD': os.environ['TEST_DB_PASSWORD'],
        'HOST': os.environ['DB_HOST'],
        'PORT': os.environ['DB_PORT'],
        'TEST':{
            'NAME': 'abet_portal_test',
        }
    }
}