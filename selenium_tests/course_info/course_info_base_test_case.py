from selenium_tests.base_selenium_test_case import BaseSeleniumTestCase
from selenium_tests.pin.page_objects.pin_login_page_object import PinLoginPageObject
from selenium_tests.account_admin.page_objects.account_admin_dashboard_page_object import AccountAdminDashboardPage

from urlparse import urljoin
from django.conf import settings


class CourseInfoBaseTestCase(BaseSeleniumTestCase):
    """
    Bulk Create base test case, all other tests will subclass this class
    """
    @classmethod
    def setUpClass(cls):
        """
        setup values for the tests
        """
        super(CourseInfoBaseTestCase, cls).setUpClass()

        driver = cls.driver
        cls.USERNAME = settings.SELENIUM_CONFIG.get('selenium_username')
        cls.PASSWORD = settings.SELENIUM_CONFIG.get('selenium_password')
        cls.CANVAS_BASE_URL = settings.SELENIUM_CONFIG.get('canvas_base_url')
        cls.TOOL_RELATIVE_URL = settings.SELENIUM_CONFIG.get('course_info_tool_relative_url')
        cls.TOOL_URL = urljoin(cls.CANVAS_BASE_URL, cls.TOOL_RELATIVE_URL)

        cls.course_info_parent_page = AccountAdminDashboardPage(driver)
        cls.course_info_parent_page.get(cls.TOOL_URL)
        login_page = PinLoginPageObject(driver)
        if login_page.is_loaded():
            print " logging the user in"
            login_page.login(cls.USERNAME, cls.PASSWORD)
        else:
            print '(User {} already logged in to PIN)'.format(cls.USERNAME)
            