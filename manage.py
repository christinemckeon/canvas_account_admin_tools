#!/usr/bin/env python
import os
import sys

if __name__ == "__main__":
    if 'test' in sys.argv:
        os.environ['DJANGO_SETTINGS_MODULE'] = 'canvas_account_admin_tools.settings.unit_test'
    else:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'canvas_account_admin_tools.settings.aws')

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
