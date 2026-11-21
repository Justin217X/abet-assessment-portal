#!/usr/bin/env python
#
# File: manage.py
# Purpose: Runs Django commands for local development, migrations, and tests.

import os
import sys

def main():

    # Use config.settings unless another settings module was selected.
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    # Pass the command and its options to Django.
    execute_from_command_line(sys.argv)


# Run main only when this file is started directly.
if __name__ == '__main__':
    main()
