"""
This file is for testing Course Details page
"""

from selenium_tests.course_info.course_info_base_test_case \
    import CourseInfoBaseTestCase


class CourseDetailsTests(CourseInfoBaseTestCase):

    def test_course_code_visible(self):
        """
        Test to see if the course code is visible
        :return:
        """

    def test_course_instance_id_visible(self):
        """
        Test to see if the course instance id is visible
        :return:
        """

    def test_course_title_visible(self):
        """
        Test to see if the course title is visible
        :return:
        """

    def test_course_code_text_expected(self):
        """
        Test to see if the course code text matches what is expected
        :return:
        """

    def test_course_title_expected(self):
        """
        Test to see if the course title text matches what is expected
        :return:
        """

    def test_people_link_text_expected_for_course_with_no_people(self):
        """
        Test to see if the people link text matches for a course that
        does not contain any people
        :return:
        """

    def test_people_link_text_expected_for_course_with_people(self):
        """
        Test to see if the people link text matches for a course that
        does contain at least 1 person
        :return:
        """

    def test_is_submit_button_visible_for_ILE_SB_course(self):
        """
        Test with ILE/SB course for visible submit button
        :return:
        """

    def test_is_submit_button_visible_for_non_ILE_SB_course(self):
        """
        Test with non ILE/SB course that the submit button is disabled
        :return:
        """