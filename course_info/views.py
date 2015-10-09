import json
import logging
from operator import itemgetter

from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.views.decorators.http import require_http_methods

from django_auth_lti import const
from django_auth_lti.decorators import lti_role_required

from course_info.canvas import get_administered_school_accounts
from icommons_common.models import TermCode


logger = logging.getLogger(__name__)


@login_required
@lti_role_required(const.ADMINISTRATOR)
@require_http_methods(['GET'])
def index(request):
    canvas_user_id = request.LTI['custom_canvas_user_id']

    # prep context data, used to fill filter dropdowns with data targeted
    # to the lti launch's user.
    context = {
        'schools': _get_schools_context(canvas_user_id),
        'terms': _get_terms_context(),
    }
    return render(request, 'course_info/index.html', context)


def _get_schools_context(canvas_user_id):
    accounts = get_administered_school_accounts(canvas_user_id)
    schools = [{
                    'key': 'school',
                    'value': a['sis_account_id'].split(':')[1],
                    'name': a['name'],
                    'query': True,
                    'text': a['name'] + ' <span class="caret"></span>',
                } for a in accounts]
    schools.sort(key=itemgetter('name'))
    schools.insert(0, {'key': 'school', 'name': 'All Schools', 'query': False,
                       'text': 'All Schools <span class="caret"></span>'})
    return json.dumps(schools)


def _get_terms_context():
    all_terms = get_terms()
    terms = [{
        'key': 'term_code',
        'value': t['term_code'],
        'name': t['term_name'],
        'query': True,
        'text': t['term_name'] + ' <span class="caret"></span>',
                } for t in all_terms]
    terms.sort(key=itemgetter('value'))
    terms.insert(0, {'key': 'term_code', 'name': 'All Terms', 'query': False,
                     'text': 'All Terms <span class="caret"></span>'})
    return json.dumps(terms)


def get_terms():
    return TermCode.objects.values('term_name', 'term_code')
