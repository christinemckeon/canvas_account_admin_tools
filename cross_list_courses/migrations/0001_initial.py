# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
         ('lti_permissions', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql="INSERT INTO lti_permissions_ltipermission "
                  "(permission, school_id, canvas_role, allow) "
                  "VALUES ('cross_listing', '*', 'AccountAdmin', TRUE),"
                  "('cross_listing', '*', 'Account admin', TRUE),"
                  "('cross_listing', '*', 'Account Admin', TRUE);",
            reverse_sql="delete  from lti_permissions_ltipermission where permission='cross_listing';",
        ),
    ]

