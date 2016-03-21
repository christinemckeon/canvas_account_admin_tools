"""
This file is reserved to represent the page objects for the course details page
"""

from selenium_tests.course_info.page_objects.course_info_base_page_object \
    import CourseInfoBasePageObject


class Locators(object):
    """
    Need Locator class with the following ID from the partials/details.html
        id="input-course-registrar_code_display"
        id="input-course-course_instance_id"
        id="input-course-title"
        id="people-link"

    """

class CoursePeoplePageObject(CourseInfoBasePageObject):
    """
    Add lined: page_loaded_locator = with locator specific to course details page

    New CourseDetailsPageObject class with the following services
    All these should return true or false
    (1) is_course_code_visible
    (2) is_course_code_match_expected
    (3) is_course_instance_visible
    (4) is_course_instance_match_expected
    (5) is_course_title_visible
    (6) is_course_title_match_expected
    (7) is_people_link_text_expected_with_course_with_no_people
    (8) is_people_link_text_expected_with_course_with_people
    (9) is_submit_button_visible

    """
